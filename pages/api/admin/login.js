import jwt from 'jsonwebtoken';
import { CRYPTO_CONFIG } from '../../../lib/constants.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    const { username, password } = req.body;
    
    // 简单的管理员验证（生产环境应使用数据库和密码哈希）
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123456';
    
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }
    
    // 生成JWT令牌
    const token = jwt.sign(
      { 
        username, 
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24小时过期
      },
      CRYPTO_CONFIG.HMAC_KEY,
      { algorithm: 'HS256' }
    );
    
    res.json({
      success: true,
      message: '登录成功',
      token,
      user: { username, role: 'admin' }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '登录失败: ' + error.message
    });
  }
}
