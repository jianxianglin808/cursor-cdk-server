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
      limit = 20, 
      status = 'all', 
      type = 'all' 
    } = req.query;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // 构建查询条件
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;
    
    if (status !== 'all') {
      whereConditions.push(`status = $${paramIndex++}`);
      queryParams.push(status);
    }
    
    if (type !== 'all') {
      whereConditions.push(`cdk_type = $${paramIndex++}`);
      queryParams.push(type);
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // 获取总数
    const countQuery = `SELECT COUNT(*) as total FROM cdks ${whereClause}`;
    const countResult = await DatabaseManager.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);
    
    // 获取CDK列表
    const cdksQuery = `
      SELECT 
        cdk_code,
        cdk_type,
        status,
        created_at,
        activated_at,
        expires_at,
        user_id,
        device_code
      FROM cdks 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    
    const cdksResult = await DatabaseManager.query(cdksQuery, [
      ...queryParams,
      parseInt(limit),
      offset
    ]);
    
    res.json({
      success: true,
      cdks: cdksResult.rows,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    });
    
  } catch (error) {
    console.error('获取CDK列表失败:', error);
    res.status(403).json({
      success: false,
      message: error.message
    });
  }
}
