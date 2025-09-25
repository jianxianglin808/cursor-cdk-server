import { BUSINESS_CONFIG } from './constants.js';
import { DatabaseManager } from './database.js';

export class CDKManager {
  // CDK激活逻辑
  static async activateCDK({ cdk, device_code, author_id, version, client_hashes }) {
    try {
      // 1. 验证CDK格式和有效性
      const cdkType = this.getCDKType(cdk);
      if (!cdkType) {
        return { success: false, message: "激活码格式错误" };
      }
      
      // 2. 检查CDK是否已被使用
      const existingActivation = await DatabaseManager.query(
        'SELECT * FROM cdks WHERE cdk_code = $1',
        [cdk]
      );
      
      if (existingActivation.rows.length > 0 && existingActivation.rows[0].status === 'ACTIVATED') {
        return { success: false, message: "激活码已被使用" };
      }
      
      // 3. 检查设备绑定数量（统一2台设备）
      const deviceCount = await DatabaseManager.query(
        'SELECT COUNT(*) FROM user_devices WHERE cdk_code = $1 AND is_active = true',
        [cdk]
      );
      
      if (deviceCount.rows[0].count >= 2) {
        return { success: false, message: "设备绑定数量已达上限(2台)" };
      }
      
      // 4. 激活CDK并绑定设备
      const activationData = {
        cdk_code: cdk,
        status: 'ACTIVATED',
        activated_at: new Date(),
        expires_at: new Date(Date.now() + cdkType.duration * 24 * 60 * 60 * 1000),
        user_id: `auth0|user_01K59VNGE1XQYTSNXPQEP66BBV`,
        device_code: device_code,
        activation_data: { version, client_hashes, author_id }
      };
      
      await DatabaseManager.query(
        'INSERT INTO cdks (cdk_code, cdk_type, status, activated_at, expires_at, user_id, device_code, activation_data) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [cdk, cdkType.name, 'ACTIVATED', activationData.activated_at, activationData.expires_at, activationData.user_id, device_code, JSON.stringify(activationData.activation_data)]
      );
      
      // 5. 记录设备绑定
      await DatabaseManager.query(
        'INSERT INTO user_devices (author_id, device_code, cdk_code) VALUES ($1, $2, $3)',
        [author_id, device_code, cdk]
      );
      
      // 6. 初始化积分记录
      await DatabaseManager.query(
        'INSERT INTO points_records (cdk_code, points_balance) VALUES ($1, $2)',
        [cdk, cdkType.points]
      );
      
      return { success: true, message: "激活成功", data: activationData };
    } catch (error) {
      return { success: false, message: "激活失败：" + error.message };
    }
  }
  
  // 获取CDK类型信息
  static getCDKType(cdk) {
    const cdkPrefix = cdk.split('-')[0];
    const cdkConfig = BUSINESS_CONFIG.CDK_TYPES[cdkPrefix];
    return cdkConfig ? { name: cdkPrefix, ...cdkConfig } : null;
  }
  
  // 检查CDK权限
  static async checkCDKPermission(cdk, permission) {
    const cdkType = this.getCDKType(cdk);
    if (!cdkType) return false;
    
    switch (permission) {
      case 'magic_free':
        return cdkType.magic_free;
      case 'cursor_max':
        return cdkType.cursor_max;
      default:
        return false;
    }
  }
  
  // 积分消耗
  static async consumePoints(cdk, operation) {
    const consumption = BUSINESS_CONFIG.POINTS_CONSUMPTION[operation] || 0;
    if (consumption === 0) return { success: true, remaining: null };
    
    try {
      const result = await DatabaseManager.query(
        'UPDATE points_records SET points_balance = points_balance - $1 WHERE cdk_code = $2 AND points_balance >= $1 RETURNING points_balance',
        [consumption, cdk]
      );
      
      if (result.rows.length === 0) {
        return { success: false, message: "积分不足" };
      }
      
      return { success: true, remaining: result.rows[0].points_balance };
    } catch (error) {
      return { success: false, message: "积分扣除失败" };
    }
  }
}
