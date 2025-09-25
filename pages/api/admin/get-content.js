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
    
    // 从数据库获取内容配置
    const result = await DatabaseManager.query(
      'SELECT * FROM content_settings ORDER BY updated_at DESC LIMIT 1'
    );
    
    let content;
    if (result.rows.length > 0) {
      content = result.rows[0].content_data;
    } else {
      // 返回默认内容
      content = {
        common_problem: "💡重要提示: 为优化使用体验，后端已完成调整，现已支持所有AI模型！<br><br>🎯 <strong>新功能特色</strong>:<br>✅ 支持Claude-4-Max模型<br>✅ 免魔法模式（Pro版专享）<br>✅ 智能账号池管理<br>✅ 断线自动重连<br><br>🔗 <a href=\"https://pay.ldxp.cn/shop/HS67LQ6L\" target=\"_blank\" style=\"color: #ff6b6b; font-weight: bold;\">立即购买激活码</a>",
        buy_url: "https://pay.ldxp.cn/shop/HS67LQ6L",
        cdk_expiration_prompt: "激活码已过期，请购买激活码",
        maintenance_notice: "",
        update_announcement: ""
      };
    }
    
    res.json({
      success: true,
      content
    });
    
  } catch (error) {
    res.status(403).json({
      success: false,
      message: error.message
    });
  }
}
