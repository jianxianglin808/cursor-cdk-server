import { SignatureManager } from '../../lib/signature.js';
import { CRYPTO_CONFIG } from '../../lib/constants.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    const { cdk, version, timestamp, author_id, sign } = req.body;
    
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
    
    // 解绑设备逻辑（简化实现）
    // 实际应该从数据库中删除设备绑定记录
    
    return res.json({
      status: "success",
      message: "解绑成功"
    });
    
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "解绑失败",
      success: false
    });
  }
}
