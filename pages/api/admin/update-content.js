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
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    // 验证管理员权限
    const admin = verifyAdmin(req);
    
    const { content } = req.body;
    
    // 验证内容字段
    const requiredFields = ['common_problem', 'buy_url', 'cdk_expiration_prompt'];
    for (const field of requiredFields) {
      if (!content[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} 字段不能为空`
        });
      }
    }
    
    // 验证URL格式
    try {
      new URL(content.buy_url);
    } catch {
      return res.status(400).json({
        success: false,
        message: '购买链接格式无效'
      });
    }
    
    // 更新数据库
    await DatabaseManager.query(`
      INSERT INTO content_settings (content_data, updated_by, updated_at) 
      VALUES ($1, $2, NOW())
      ON CONFLICT (id) DO UPDATE SET 
        content_data = EXCLUDED.content_data,
        updated_by = EXCLUDED.updated_by,
        updated_at = EXCLUDED.updated_at
    `, [JSON.stringify(content), admin.username]);
    
    res.json({
      success: true,
      message: '内容更新成功！'
    });
    
  } catch (error) {
    res.status(403).json({
      success: false,
      message: error.message
    });
  }
}
