import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { DatabaseManager } from '../../../../lib/database.js';
import { CRYPTO_CONFIG, BUSINESS_CONFIG } from '../../../../lib/constants.js';

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

function generateCDKCode(type) {
  // 生成格式: TYPE-XXXX-XXXX-XXXX
  const prefix = type.toUpperCase();
  const randomPart = crypto.randomBytes(6).toString('hex').toUpperCase();
  return `${prefix}-${randomPart.slice(0,4)}-${randomPart.slice(4,8)}-${randomPart.slice(8,12)}`;
}

function calculateExpiration(type) {
  const now = new Date();
  const cdkConfig = BUSINESS_CONFIG.CDK_TYPES[type];
  
  if (!cdkConfig) {
    throw new Error(`未知的CDK类型: ${type}`);
  }
  
  // 根据类型计算过期时间
  switch (type) {
    case 'DAYPRO':
    case 'DAY':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1天
    case 'WEEKPRO':
    case 'WEEK':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7天
    case 'MONTHPRO':
    case 'MONTH':
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30天
    case 'QUARTERPRO':
    case 'QUARTER':
      return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90天
    case 'YEARPRO':
      return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 365天
    default:
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 默认30天
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    // 验证管理员权限
    const admin = verifyAdmin(req);
    
    const { type, count = 1 } = req.body;
    
    if (!type) {
      return res.status(400).json({
        success: false,
        message: '请提供CDK类型'
      });
    }
    
    // 验证CDK类型
    if (!BUSINESS_CONFIG.CDK_TYPES[type]) {
      return res.status(400).json({
        success: false,
        message: '无效的CDK类型'
      });
    }
    
    // 验证生成数量
    const generateCount = parseInt(count);
    if (generateCount < 1 || generateCount > 100) {
      return res.status(400).json({
        success: false,
        message: '生成数量必须在1-100之间'
      });
    }
    
    const generatedCDKs = [];
    const expiresAt = calculateExpiration(type);
    
    // 生成CDK
    for (let i = 0; i < generateCount; i++) {
      let cdkCode;
      let isUnique = false;
      let attempts = 0;
      
      // 确保CDK代码唯一性
      while (!isUnique && attempts < 10) {
        cdkCode = generateCDKCode(type);
        
        // 检查是否已存在
        const checkQuery = 'SELECT COUNT(*) as count FROM cdks WHERE cdk_code = $1';
        const checkResult = await DatabaseManager.query(checkQuery, [cdkCode]);
        
        if (parseInt(checkResult.rows[0].count) === 0) {
          isUnique = true;
        }
        attempts++;
      }
      
      if (!isUnique) {
        throw new Error('无法生成唯一的CDK代码，请重试');
      }
      
      // 插入数据库
      const insertQuery = `
        INSERT INTO cdks (cdk_code, cdk_type, status, created_at, expires_at)
        VALUES ($1, $2, $3, NOW(), $4)
      `;
      
      await DatabaseManager.query(insertQuery, [
        cdkCode,
        type,
        'unused',
        expiresAt
      ]);
      
      generatedCDKs.push({
        cdk_code: cdkCode,
        cdk_type: type,
        status: 'unused',
        expires_at: expiresAt.toISOString()
      });
    }
    
    // 记录管理操作日志
    await DatabaseManager.query(`
      INSERT INTO admin_logs (admin_username, action, details, ip_address, user_agent, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
    `, [
      admin.username,
      'CDK_GENERATE',
      JSON.stringify({ 
        type, 
        count: generateCount,
        generated_codes: generatedCDKs.map(cdk => cdk.cdk_code),
        timestamp: new Date().toISOString()
      }),
      req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown',
      req.headers['user-agent'] || 'unknown'
    ]);
    
    res.json({
      success: true,
      message: `成功生成 ${generateCount} 个 ${type} 类型的CDK`,
      cdks: generatedCDKs
    });
    
  } catch (error) {
    console.error('生成CDK失败:', error);
    res.status(500).json({
      success: false,
      message: '生成失败: ' + error.message
    });
  }
}
