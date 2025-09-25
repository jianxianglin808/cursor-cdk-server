import { SignatureManager } from '../../lib/signature.js';
import { NonceManager } from '../../lib/nonce.js';
import { CRYPTO_CONFIG } from '../../lib/constants.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    const { cdk, timestamp, device_code, sign } = req.body;
    
    // 验证时间戳和签名
    if (Math.abs(Date.now() - timestamp) > 20000) {
      return res.status(400).json({
        code: 400,
        message: "请求时间戳超出允许范围",
        success: false
      });
    }
    
    if (!SignatureManager.verifyRequestSignature(req)) {
      return res.status(403).json({
        code: 403,
        message: "签名验证失败，拒绝访问",
        success: false
      });
    }
    
    // 查询积分（基于🔍端到端API总结报告的精确格式）
    const pointsData = {
      nonce: NonceManager.generateNonce(),
      points: 1400, // 实际应从数据库查询
      timestamp: timestamp
    };
    
    const encryptedResponse = NonceManager.createResponse(
      pointsData,
      CRYPTO_CONFIG.WEB_AES_KEY,
      CRYPTO_CONFIG.HMAC_KEY
    );
    
    res.json(encryptedResponse);
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "积分查询失败",
      success: false
    });
  }
}
