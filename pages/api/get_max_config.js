import { SignatureManager } from '../../lib/signature.js';
import { CDKManager } from '../../lib/cdk-manager.js';
import { CRYPTO_CONFIG } from '../../lib/constants.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    const { cdk, version, timestamp, device_code, sign } = req.body;
    
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
    
    // 检查CDK是否支持CursorMax功能
    const hasPermission = await CDKManager.checkCDKPermission(cdk, 'cursor_max');
    if (!hasPermission) {
      return res.status(403).json({
        code: 403,
        message: "🤖MAX模型 | 仅对【月/季/年卡】用户开放",
        success: false
      });
    }
    
    // 返回CursorMax配置（如果有权限）
    return res.json({
      code: 200,
      success: true,
      message: "获取成功",
      data: {
        max_enabled: true,
        max_models: ["claude-4-max", "gpt-4-turbo"],
        max_requests_per_day: 50
      }
    });
    
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "配置获取失败",
      success: false
    });
  }
}
