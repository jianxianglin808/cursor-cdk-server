import { SignatureManager } from '../../lib/signature.js';
import { NonceManager } from '../../lib/nonce.js';
import { CRYPTO_CONFIG } from '../../lib/constants.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    // 1. 提取所有必需参数（基于🔍端到端API总结报告）
    const { timestamp, device_code, author_id, sign } = req.body;
    const now = Date.now();
    if (Math.abs(now - timestamp) > 20000) {
      return res.status(400).json({
        code: 400,
        message: "请求时间戳超出允许范围",
        success: false
      });
    }
    
    // 2. 签名验证
    if (!SignatureManager.verifyRequestSignature(req)) {
      return res.status(403).json({
        code: 403,
        message: "签名验证失败，拒绝访问",
        success: false
      });
    }
    
    // 3. 返回设置数据（基于端到端报告的精确格式）
    const settingsData = {
      active_account_pool: "cursor_accounts",
      buy_url: "https://pay.ldxp.cn/shop/HS67LQ6L",
      cdk_expiration_prompt: "激活码已过期，请购买激活码",
      common_problem: "💡重要提示: 为优化使用体验，后端已完成调整，现已支持所有AI模型！<br><br>🎯 <strong>新功能特色</strong>:<br>✅ 支持Claude-4-Max模型<br>✅ 免魔法模式（Pro版专享）<br>✅ 智能账号池管理<br>✅ 断线自动重连<br><br>🔗 <a href=\"https://pay.ldxp.cn/shop/HS67LQ6L\" target=\"_blank\" style=\"color: #ff6b6b; font-weight: bold;\">立即购买激活码</a>",
      cursor_max_enabled: true,
      magic_free_enabled: true,
      claude_4_max_support: true
    };
    
    // 4. 加密响应
    const encryptedResponse = NonceManager.createResponse(
      settingsData, 
      CRYPTO_CONFIG.WEB_AES_KEY,
      CRYPTO_CONFIG.HMAC_KEY
    );
    
    res.json(encryptedResponse);
  } catch (error) {
    res.status(500).json({ 
      code: 500, 
      message: "服务器内部错误", 
      success: false 
    });
  }
}
