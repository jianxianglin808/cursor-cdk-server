import { SignatureManager } from '../../lib/signature.js';
import { NonceManager } from '../../lib/nonce.js';
import { CRYPTO_CONFIG } from '../../lib/constants.js';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    // AI授权端点简化参数（基于🎉完整拦截数据分析报告）
    const { cdk, timestamp, sign } = req.body;
    
    // 验证签名（最简参数集）
    const verifyParams = { cdk, timestamp };
    const expectedSign = SignatureManager.generateSignature(verifyParams);
    
    if (sign !== expectedSign) {
      return res.status(403).json({
        code: 403,
        message: "签名验证失败",
        success: false
      });
    }
    
    // 生成JWT令牌（基于端到端报告的HS256算法）
    const jwtPayload = {
      sub: `auth0|user_${Date.now()}`,
      time: Math.floor(Date.now() / 1000).toString(),
      randomness: `${Math.random().toString(36).substring(2)}-${Math.random().toString(36).substring(2)}`,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24小时过期
      iss: "https://authentication.cursor.sh",
      scope: "openid profile email offline_access"
    };
    
    const token = jwt.sign(jwtPayload, CRYPTO_CONFIG.HMAC_KEY, { algorithm: 'HS256' });
    
    // 构造授权数据（基于🔍端到端API总结报告第442-448行的精确格式）
    const authData = {
      checksum: `c2xud6XCf${Math.random().toString(16).substring(2, 56)}/${Math.random().toString(16).substring(2, 64)}`,
      forwarded: `${Math.random().toString(16).substring(2, 8)}-0000-4000-${Math.random().toString(16).substring(2, 4)}-${Math.random().toString(16).substring(2, 12)}`,
      nonce: NonceManager.generateNonce(),
      timestamp: timestamp,
      token: token
    };
    
    // 加密响应
    const encryptedResponse = NonceManager.createResponse(
      authData,
      CRYPTO_CONFIG.WEB_AES_KEY,
      CRYPTO_CONFIG.HMAC_KEY
    );
    
    res.json({
      status: "success",
      data: encryptedResponse
    });
    
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "授权失败",
      success: false
    });
  }
}
