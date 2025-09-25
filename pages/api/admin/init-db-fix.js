// 修复版数据库初始化接口
import jwt from 'jsonwebtoken';
import { DatabaseManager } from '../../../lib/database.js';
import { CRYPTO_CONFIG } from '../../../lib/constants.js';

function verifyAdmin(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('未提供认证令牌');
  }
  
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, CRYPTO_CONFIG.HMAC_KEY);
    if (decoded.role !== 'admin') {
      throw new Error('权限不足');
    }
    return decoded;
  } catch (error) {
    throw new Error('令牌无效或已过期');
  }
}

export default async function handler(req, res) {
  // 支持GET和POST方法
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ 
      success: false,
      message: `方法 ${req.method} 不被允许。请使用 POST 或 GET。`
    });
  }
  
  try {
    // 验证管理员权限
    const admin = verifyAdmin(req);
    
    // 获取force参数
    const force = req.method === 'POST' ? 
      (req.body?.force || false) : 
      (req.query?.force === 'true');
    
    console.log(`管理员 ${admin.username} 请求初始化数据库 (force: ${force})`);
    
    // 检查环境变量
    if (!process.env.POSTGRES_URL) {
      return res.status(500).json({
        success: false,
        message: '数据库连接未配置。请在 Vercel 项目设置中添加 POSTGRES_URL 环境变量。'
      });
    }
    
    // 1. 测试数据库连接
    let connectionTest;
    try {
      connectionTest = await DatabaseManager.query('SELECT NOW() as current_time');
    } catch (connError) {
      return res.status(500).json({
        success: false,
        message: `数据库连接失败: ${connError.message}`
      });
    }
    
    // 2. 初始化数据库表结构
    const initResult = await initializeTables();
    if (!initResult.success) {
      return res.status(500).json({
        success: false,
        message: `表初始化失败: ${initResult.message}`
      });
    }
    
    // 3. 插入默认内容配置
    try {
      await insertDefaultContent(force);
    } catch (contentError) {
      console.warn('插入默认内容失败:', contentError);
      // 不阻止初始化成功，只记录警告
    }
    
    // 4. 记录管理操作日志
    try {
      await logAdminAction(admin.username, 'DATABASE_INIT', { force }, req);
    } catch (logError) {
      console.warn('记录日志失败:', logError);
      // 不阻止初始化成功
    }
    
    // 5. 获取初始化后的统计信息
    const stats = await getDatabaseStats();
    
    res.json({
      success: true,
      message: '数据库初始化成功',
      details: {
        connection: '正常',
        tables: initResult.tablesCreated,
        stats: stats,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('数据库初始化失败:', error);
    res.status(500).json({
      success: false,
      message: `数据库初始化失败: ${error.message}`,
      error_code: error.code || 'UNKNOWN'
    });
  }
}

// 初始化数据库表
async function initializeTables() {
  const tables = [];
  
  try {
    // CDK表
    await DatabaseManager.query(`
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
      )
    `);
    tables.push('cdks');
    
    // 用户设备表
    await DatabaseManager.query(`
      CREATE TABLE IF NOT EXISTS user_devices (
        id SERIAL PRIMARY KEY,
        author_id VARCHAR(50) NOT NULL,
        device_code VARCHAR(200) UNIQUE NOT NULL,
        cdk_code VARCHAR(50) NOT NULL,
        bound_at TIMESTAMP DEFAULT NOW(),
        last_active TIMESTAMP DEFAULT NOW(),
        is_active BOOLEAN DEFAULT TRUE
      )
    `);
    tables.push('user_devices');
    
    // 积分记录表
    await DatabaseManager.query(`
      CREATE TABLE IF NOT EXISTS points_records (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        device_code VARCHAR(200) NOT NULL,
        points_balance INTEGER DEFAULT 0,
        last_updated TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    tables.push('points_records');
    
    // 内容设置表
    await DatabaseManager.query(`
      CREATE TABLE IF NOT EXISTS content_settings (
        id SERIAL PRIMARY KEY,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    tables.push('content_settings');
    
    // 管理员日志表
    await DatabaseManager.query(`
      CREATE TABLE IF NOT EXISTS admin_logs (
        id SERIAL PRIMARY KEY,
        admin_username VARCHAR(50) NOT NULL,
        action VARCHAR(100) NOT NULL,
        details JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    tables.push('admin_logs');
    
    // 创建索引
    await DatabaseManager.query(`
      CREATE INDEX IF NOT EXISTS idx_cdks_status ON cdks(status);
      CREATE INDEX IF NOT EXISTS idx_cdks_code ON cdks(cdk_code);
      CREATE INDEX IF NOT EXISTS idx_user_devices_active ON user_devices(is_active);
      CREATE INDEX IF NOT EXISTS idx_admin_logs_created ON admin_logs(created_at DESC);
    `);
    
    return { success: true, tablesCreated: tables };
    
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// 插入默认内容
async function insertDefaultContent(force) {
  const defaultSettings = [
    ['common_problem', '💡重要提示: 为优化使用体验，后端已完成调整，现已支持所有AI模型！'],
    ['buy_url', 'https://pay.ldxp.cn/shop/HS67LQ6L'],
    ['cdk_expiration_prompt', '激活码已过期，请购买激活码'],
    ['maintenance_notice', ''],
    ['update_announcement', '']
  ];
  
  for (const [key, value] of defaultSettings) {
    if (force) {
      await DatabaseManager.query(`
        INSERT INTO content_settings (setting_key, setting_value, updated_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (setting_key) DO UPDATE SET
        setting_value = EXCLUDED.setting_value,
        updated_at = EXCLUDED.updated_at
      `, [key, value]);
    } else {
      await DatabaseManager.query(`
        INSERT INTO content_settings (setting_key, setting_value, updated_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (setting_key) DO NOTHING
      `, [key, value]);
    }
  }
}

// 记录管理员操作日志
async function logAdminAction(username, action, details, req) {
  await DatabaseManager.query(`
    INSERT INTO admin_logs (admin_username, action, details, ip_address, user_agent, created_at)
    VALUES ($1, $2, $3, $4, $5, NOW())
  `, [
    username,
    action,
    JSON.stringify(details),
    req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown',
    req.headers['user-agent'] || 'unknown'
  ]);
}

// 获取数据库统计信息
async function getDatabaseStats() {
  const stats = {};
  
  const tables = ['cdks', 'user_devices', 'points_records', 'content_settings', 'admin_logs'];
  
  for (const tableName of tables) {
    try {
      const result = await DatabaseManager.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      stats[tableName] = parseInt(result.rows[0].count);
    } catch (error) {
      stats[tableName] = 0;
    }
  }
  
  return stats;
}
