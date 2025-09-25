import crypto from 'crypto';
import { SignatureManager } from './signature.js';

export class NonceManager {
  // 基于🎯NONCE机制完全破解报告的标准生成方式
  static generateNonce() {
    return crypto.randomBytes(16).toString('hex');
  }
  
  // 创建完整响应（与extension.js客户端完全兼容）
  static createResponse(businessData, aesKey, hmacKey) {
    // 1. AES-CBC-256加密 (修正：使用createCipheriv)
    const iv = crypto.randomBytes(16);
    const keyBuffer = Buffer.from(aesKey, 'hex');
    const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, iv);
    let encrypted = cipher.update(JSON.stringify(businessData), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // 2. 生成nonce和时间戳
    const nonce = this.generateNonce();
    const timestamp = Date.now();
    
    // 3. 计算响应签名（与客户端验证算法完全一致）
    const sign = SignatureManager.generateResponseSignature(
      encrypted, 
      iv.toString('hex'), 
      nonce, 
      timestamp
    );
    
    // 4. 返回完整响应结构
    return {
      encrypted,
      iv: iv.toString('hex'),
      nonce,
      timestamp,
      sign
    };
  }
}
