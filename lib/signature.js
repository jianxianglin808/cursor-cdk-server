import crypto from 'crypto';
import { CRYPTO_CONFIG } from './constants.js';

export class SignatureManager {
  // 基于extension.js精确匹配的签名生成算法
  static generateSignature(params, hmacKey = CRYPTO_CONFIG.HMAC_KEY) {
    // 1. 按键名字母序排序（与extension.js完全一致）
    const sortedKeys = Object.keys(params).sort();
    
    // 2. URLSearchParams序列化（精确匹配客户端算法）
    const urlParams = new URLSearchParams();
    sortedKeys.forEach(key => {
      urlParams.set(key, params[key]);
    });
    const signString = urlParams.toString();
    
    // 3. HMAC-SHA256签名（与客户端算法一致）
    return crypto.createHmac('sha256', hmacKey)
                 .update(signString, 'utf8')
                 .digest('hex');
  }
  
  // 验证请求签名
  static verifyRequestSignature(req) {
    const { sign, ...params } = req.body;
    const expectedSign = this.generateSignature(params);
    return sign === expectedSign;
  }
  
  // 生成响应签名（基于NONCE机制报告）
  static generateResponseSignature(encrypted, iv, nonce, timestamp) {
    const signData = { 
      encrypted, 
      iv: iv.toString(), 
      nonce, 
      timestamp: timestamp.toString() 
    };
    return this.generateSignature(signData);
  }
}
