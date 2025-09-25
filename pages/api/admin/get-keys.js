import jwt from 'jsonwebtoken';
import { CRYPTO_CONFIG } from '../../../lib/constants.js';

// 验证管理员权限中间件
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
    
    // 返回当前密钥（出于安全考虑，可以选择只返回前几位）
    const keys = {
      HMAC_KEY: process.env.HMAC_KEY || CRYPTO_CONFIG.HMAC_KEY,
      WEB_AES_KEY: process.env.WEB_AES_KEY || CRYPTO_CONFIG.WEB_AES_KEY,
      NODE_AES_KEY: process.env.NODE_AES_KEY || CRYPTO_CONFIG.NODE_AES_KEY
    };
    
    res.json({
      success: true,
      keys
    });
    
  } catch (error) {
    res.status(403).json({
      success: false,
      message: error.message
    });
  }
}
