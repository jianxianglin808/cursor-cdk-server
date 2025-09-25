import jwt from 'jsonwebtoken';
import { DatabaseManager } from '../../../lib/database.js';
import { CRYPTO_CONFIG } from '../../../lib/constants.js';

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
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    // 验证管理员权限
    verifyAdmin(req);
    
    const { 
      page = 1, 
      limit = 50, 
      action = 'all', 
      admin = 'all',
      timeRange = '24h'
    } = req.query;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // 构建查询条件
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;
    
    // 时间范围筛选
    if (timeRange !== 'all') {
      let timeCondition;
      switch (timeRange) {
        case '1h':
          timeCondition = 'created_at >= NOW() - INTERVAL \'1 hour\'';
          break;
        case '24h':
          timeCondition = 'created_at >= NOW() - INTERVAL \'24 hours\'';
          break;
        case '7d':
          timeCondition = 'created_at >= NOW() - INTERVAL \'7 days\'';
          break;
        case '30d':
          timeCondition = 'created_at >= NOW() - INTERVAL \'30 days\'';
          break;
        default:
          timeCondition = null;
      }
      if (timeCondition) {
        whereConditions.push(timeCondition);
      }
    }
    
    // 操作类型筛选
    if (action !== 'all') {
      whereConditions.push(`action = $${paramIndex++}`);
      queryParams.push(action);
    }
    
    // 管理员筛选
    if (admin !== 'all') {
      whereConditions.push(`admin_username = $${paramIndex++}`);
      queryParams.push(admin);
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // 获取总数
    const countQuery = `SELECT COUNT(*) as total FROM admin_logs ${whereClause}`;
    const countResult = await DatabaseManager.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);
    
    // 获取日志列表
    const logsQuery = `
      SELECT 
        id,
        admin_username,
        action,
        details,
        ip_address,
        user_agent,
        created_at
      FROM admin_logs 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    
    const logsResult = await DatabaseManager.query(logsQuery, [
      ...queryParams,
      parseInt(limit),
      offset
    ]);
    
    res.json({
      success: true,
      logs: logsResult.rows,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    });
    
  } catch (error) {
    console.error('获取日志列表失败:', error);
    res.status(403).json({
      success: false,
      message: error.message
    });
  }
}
