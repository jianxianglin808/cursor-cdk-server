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
    
    const { cdk_code, status } = req.body;
    
    if (!cdk_code || !status) {
      return res.status(400).json({
        success: false,
        message: '请提供CDK代码和新状态'
      });
    }
    
    // 验证状态值
    const validStatuses = ['unused', 'active', 'expired', 'disabled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: '无效的状态值'
      });
    }
    
    // 检查CDK是否存在
    const checkQuery = 'SELECT * FROM cdks WHERE cdk_code = $1';
    const checkResult = await DatabaseManager.query(checkQuery, [cdk_code]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'CDK不存在'
      });
    }
    
    const cdk = checkResult.rows[0];
    
    // 状态转换验证
    if (cdk.status === 'active' && status !== 'expired') {
      return res.status(400).json({
        success: false,
        message: '已激活的CDK只能设为过期状态'
      });
    }
    
    // 更新CDK状态
    const updateQuery = 'UPDATE cdks SET status = $1 WHERE cdk_code = $2';
    await DatabaseManager.query(updateQuery, [status, cdk_code]);
    
    // 记录管理操作日志
    await DatabaseManager.query(`
      INSERT INTO admin_logs (admin_username, action, details, ip_address, user_agent, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
    `, [
      admin.username,
      'CDK_STATUS_UPDATE',
      JSON.stringify({ 
        cdk_code, 
        old_status: cdk.status, 
        new_status: status,
        timestamp: new Date().toISOString()
      }),
      req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown',
      req.headers['user-agent'] || 'unknown'
    ]);
    
    res.json({
      success: true,
      message: `CDK状态已更新为${status}`
    });
    
  } catch (error) {
    console.error('更新CDK状态失败:', error);
    res.status(500).json({
      success: false,
      message: '更新失败: ' + error.message
    });
  }
}
