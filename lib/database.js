import { sql } from '@vercel/postgres';
import { kv } from '@vercel/kv';

export class DatabaseManager {
  // PostgreSQL连接
  static async query(text, params) {
    try {
      const result = await sql.query(text, params);
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }
  
  // Redis缓存操作
  static async setCache(key, value, ttl = 3600) {
    await kv.setex(key, ttl, JSON.stringify(value));
  }
  
  static async getCache(key) {
    const result = await kv.get(key);
    return result ? JSON.parse(result) : null;
  }
  
  // 签名防重放缓存
  static async checkSignatureReplay(signature) {
    const key = `sign:${signature}`;
    const exists = await kv.exists(key);
    if (exists) return true;
    
    await kv.setex(key, 20, '1'); // 20秒缓存
    return false;
  }
  
  // 数据库初始化
  static async initDatabase() {
    try {
      console.log('开始初始化数据库...');
      await sql.query(INIT_SQL);
      console.log('数据库初始化完成');
      return { success: true, message: '数据库初始化成功' };
    } catch (error) {
      console.error('数据库初始化失败:', error);
      return { success: false, message: '数据库初始化失败: ' + error.message };
    }
  }
}

// 数据库初始化SQL
export const INIT_SQL = `
CREATE TABLE IF NOT EXISTS cdks (
    id SERIAL PRIMARY KEY,
    cdk_code VARCHAR(50) UNIQUE NOT NULL,
    cdk_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'UNUSED',
    created_at TIMESTAMP DEFAULT NOW(),
    activated_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    user_id VARCHAR(100) NULL,
    device_code VARCHAR(200) NULL,
    activation_data JSONB NULL
);

CREATE TABLE IF NOT EXISTS user_devices (
    id SERIAL PRIMARY KEY,
    author_id VARCHAR(50) NOT NULL,
    device_code VARCHAR(200) UNIQUE NOT NULL,
    cdk_code VARCHAR(50) NOT NULL,
    bound_at TIMESTAMP DEFAULT NOW(),
    last_active TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS points_records (
    id SERIAL PRIMARY KEY,
    cdk_code VARCHAR(50) NOT NULL,
    points_balance INTEGER DEFAULT 1400,
    last_updated TIMESTAMP DEFAULT NOW(),
    usage_history JSONB DEFAULT '[]'
);

-- 管理后台相关表
CREATE TABLE IF NOT EXISTS content_settings (
    id SERIAL PRIMARY KEY,
    content_data JSONB NOT NULL,
    updated_by VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_logs (
    id SERIAL PRIMARY KEY,
    admin_username VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cdks_code ON cdks(cdk_code);
CREATE INDEX IF NOT EXISTS idx_cdks_status ON cdks(status);
CREATE INDEX IF NOT EXISTS idx_devices_code ON user_devices(device_code);
CREATE INDEX IF NOT EXISTS idx_content_settings_updated ON content_settings(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created ON admin_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_username ON admin_logs(admin_username);
`;
