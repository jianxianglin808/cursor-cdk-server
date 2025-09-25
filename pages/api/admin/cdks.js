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
    
    // 检查数据库连接是否配置
    if (!process.env.POSTGRES_URL) {
      return res.status(500).json({
        success: false,
        message: '数据库连接未配置。请在Vercel项目设置中添加POSTGRES_URL环境变量。',
        configRequired: true
      });
    }
    
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
    
    // 根据错误类型返回更明确的错误信息
    let errorMessage = error.message;
    if (error.message.includes('relation "cdks" does not exist')) {
      errorMessage = '数据库表未初始化。请先在"数据库管理"页面点击"初始化数据库"。';
    } else if (error.message.includes('connection')) {
      errorMessage = '数据库连接失败。请检查POSTGRES_URL环境变量配置。';
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      needsInit: error.message.includes('relation "cdks" does not exist')
    });
  }
}
