import jwt from 'jsonwebtoken';
import { DatabaseManager } from '../../../../lib/database.js';
import { CRYPTO_CONFIG } from '../../../../lib/constants.js';

function verifyAdmin(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('未提供认证令牌');
  }
  
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, CRYPTO_CONFIG.HMAC_KEY);
    if (decoded.role !== 'admin') {
      throw new Error('权限不足');
    }
    return decoded;
  } catch (error) {
    throw new Error('令牌无效或已过期');
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    // 验证管理员权限
    const admin = verifyAdmin(req);
    
    const { timeRange } = req.body;
    
    if (!timeRange) {
      return res.status(400).json({
        success: false,
        message: '请提供时间范围参数'
      });
    }
    
    let deleteQuery;
    let timeCondition;
    
    // 根据时间范围构建删除条件
    switch (timeRange) {
      case '7d':
        timeCondition = 'created_at < NOW() - INTERVAL \'7 days\'';
        break;
      case '30d':
        timeCondition = 'created_at < NOW() - INTERVAL \'30 days\'';
        break;
      case 'all':
        timeCondition = '1=1'; // 删除全部，但保留当前操作记录
        break;
      default:
        return res.status(400).json({
          success: false,
          message: '无效的时间范围参数'
        });
    }
    
    // 构建删除查询
    if (timeRange === 'all') {
      // 删除全部时，保留当前管理员的当前登录记录
      deleteQuery = `
        DELETE FROM admin_logs 
        WHERE NOT (admin_username = $1 AND action = 'LOGIN' AND created_at > NOW() - INTERVAL '1 hour')
      `;
    } else {
      deleteQuery = `DELETE FROM admin_logs WHERE ${timeCondition}`;
    }
    
    // 先统计将要删除的记录数
    const countQuery = timeRange === 'all' 
      ? `SELECT COUNT(*) as count FROM admin_logs WHERE NOT (admin_username = $1 AND action = 'LOGIN' AND created_at > NOW() - INTERVAL '1 hour')`
      : `SELECT COUNT(*) as count FROM admin_logs WHERE ${timeCondition}`;
    
    const countParams = timeRange === 'all' ? [admin.username] : [];
    const countResult = await DatabaseManager.query(countQuery, countParams);
    const deletedCount = parseInt(countResult.rows[0].count);
    
    // 执行删除
    const deleteParams = timeRange === 'all' ? [admin.username] : [];
    await DatabaseManager.query(deleteQuery, deleteParams);
    
    // 记录此次清理操作（在清理后记录，避免被清理掉）
    await DatabaseManager.query(`
      INSERT INTO admin_logs (admin_username, action, details, ip_address, user_agent, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
    `, [
      admin.username,
      'LOGS_CLEAR',
      JSON.stringify({ 
        timeRange,
        deletedCount,
        timestamp: new Date().toISOString()
      }),
      req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown',
      req.headers['user-agent'] || 'unknown'
    ]);
    
    res.json({
      success: true,
      message: `成功清除 ${deletedCount} 条日志记录`,
      deletedCount
    });
    
  } catch (error) {
    console.error('清除日志失败:', error);
    res.status(500).json({
      success: false,
      message: '清除失败: ' + error.message
    });
  }
}
