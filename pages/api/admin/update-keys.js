import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
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
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    // 验证管理员权限
    verifyAdmin(req);
    
    const { keys } = req.body;
    
    // 验证密钥格式
    const hexRegex = /^[a-fA-F0-9]{64}$/;
    for (const [keyName, keyValue] of Object.entries(keys)) {
      if (!hexRegex.test(keyValue)) {
        return res.status(400).json({
          success: false,
          message: `${keyName} 格式错误：必须是64字符十六进制字符串`
        });
      }
    }
    
    // 更新环境变量文件（Vercel环境变量需要通过Dashboard或CLI更新）
    // 这里只是示例，实际部署时需要通过Vercel API或手动更新
    const envContent = `
# 更新时间: ${new Date().toISOString()}
HMAC_KEY=${keys.HMAC_KEY}
WEB_AES_KEY=${keys.WEB_AES_KEY}
NODE_AES_KEY=${keys.NODE_AES_KEY}

# 管理后台
ADMIN_USERNAME=${process.env.ADMIN_USERNAME || 'admin'}
ADMIN_PASSWORD=${process.env.ADMIN_PASSWORD || 'admin123456'}
ADMIN_SESSION_SECRET=${process.env.ADMIN_SESSION_SECRET || 'your_session_secret_here'}
`;
    
    // 在本地环境写入.env.local文件
    if (process.env.NODE_ENV !== 'production') {
      const envPath = path.join(process.cwd(), '.env.local');
      fs.writeFileSync(envPath, envContent);
    }
    
    res.json({
      success: true,
      message: '密钥更新成功！请注意：生产环境需要通过Vercel Dashboard手动更新环境变量。'
    });
    
  } catch (error) {
    res.status(403).json({
      success: false,
      message: error.message
    });
  }
}
