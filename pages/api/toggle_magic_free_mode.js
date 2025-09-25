import { SignatureManager } from '../../lib/signature.js';
import { CDKManager } from '../../lib/cdk-manager.js';
import { CRYPTO_CONFIG } from '../../lib/constants.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    const { cdk, device_code, enabled, timestamp, sign } = req.body;
    
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
    
    // 检查CDK是否支持免魔法功能
    const hasPermission = await CDKManager.checkCDKPermission(cdk, 'magic_free');
    if (!hasPermission) {
      return res.status(403).json({
        code: 403,
        message: "🤖免魔法功能 | 仅对【Pro版】用户开放",
        success: false
      });
    }
    
    // 切换免魔法模式
    if (enabled === 1) {
      return res.json({
        status: "success",
        message: "免魔法模式已开启，重启Cursor生效！<br><div style=\"color: #666;font-size: 13px;margin-top: 10px;padding: 8px;background-color: #f5dcdc;border-radius: 4px;\">💡 如果还报错锁国区：<strong style=\"color: #ff0000;\">Model not available</strong>，请尝试多问答几次！</div>",
        data: {
          enabled: 1
        }
      });
    } else {
      return res.json({
        status: "success",
        message: "免魔法模式已关闭，必须挂魔法才可使用！",
        data: {
          enabled: 0
        }
      });
    }
    
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "切换失败",
      success: false
    });
  }
}
