import { SignatureManager } from '../../lib/signature.js';
import { NonceManager } from '../../lib/nonce.js';
import { CDKManager } from '../../lib/cdk-manager.js';
import { CRYPTO_CONFIG } from '../../lib/constants.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    // 提取参数（与extension.js请求格式完全一致）
    const { 
      cdk, 
      version, 
      timestamp, 
      device_code, 
      author_id, 
      client_hashes,
      sign 
    } = req.body;
    
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
    
    // CDK激活逻辑
    const activationResult = await CDKManager.activateCDK({
      cdk,
      device_code,
      author_id,
      version,
      client_hashes
    });
    
    if (!activationResult.success) {
      return res.status(400).json({
        code: 400,
        message: activationResult.message,
        success: false
      });
    }
    
    // 返回激活数据（基于🔍端到端API总结报告的精确格式）
    const activationData = {
      activatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      boundDevices: 1,
      cdk: cdk,
      cookies: "[{'name': 'WorkosCursorSessionToken', 'value': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'}]",
      user_id: `auth0|user_01K59VNGE1XQYTSNXPQEP66BBV`,
      access_token: `gho_${Math.random().toString(36).substring(2, 42)}`,
      refresh_token: `ghr_${Math.random().toString(36).substring(2, 42)}`,
      expires_in: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30天后过期
      scope: "openid profile email offline_access"
    };
    
    const encryptedResponse = NonceManager.createResponse(
      activationData,
      CRYPTO_CONFIG.WEB_AES_KEY,
      CRYPTO_CONFIG.HMAC_KEY
    );
    
    res.json(encryptedResponse);
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "激活失败",
      success: false
    });
  }
}
