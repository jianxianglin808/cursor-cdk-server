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
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    // 验证管理员权限
    const admin = verifyAdmin(req);
    
    const { force = false } = req.body;
    
    console.log(`管理员 ${admin.username} 请求初始化数据库 (force: ${force})`);
    
    // 1. 初始化数据库表结构
    const result = await DatabaseManager.initDatabase();
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.message
      });
    }
    
    // 2. 插入默认内容配置（如果不存在）
    const defaultContent = {
      common_problem: "💡重要提示: 为优化使用体验，后端已完成调整，现已支持所有AI模型！<br><br>🎯 <strong>新功能特色</strong>:<br>✅ 支持Claude-4-Max模型<br>✅ 免魔法模式（Pro版专享）<br>✅ 智能账号池管理<br>✅ 断线自动重连<br><br>🔗 <a href=\"https://pay.ldxp.cn/shop/HS67LQ6L\" target=\"_blank\" style=\"color: #ff6b6b; font-weight: bold;\">立即购买激活码</a>",
      buy_url: "https://pay.ldxp.cn/shop/HS67LQ6L",
      cdk_expiration_prompt: "激活码已过期，请购买激活码",
      maintenance_notice: "",
      update_announcement: ""
    };
    
    await DatabaseManager.query(`
      INSERT INTO content_settings (content_data, updated_by, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (id) DO ${force ? 'UPDATE SET content_data = EXCLUDED.content_data, updated_by = EXCLUDED.updated_by, updated_at = EXCLUDED.updated_at' : 'NOTHING'}
    `, [JSON.stringify(defaultContent), admin.username]);
    
    // 3. 记录管理操作日志
    await DatabaseManager.query(`
      INSERT INTO admin_logs (admin_username, action, details, ip_address, user_agent, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
    `, [
      admin.username,
      'DATABASE_INIT',
      JSON.stringify({ force, timestamp: new Date().toISOString() }),
      req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown',
      req.headers['user-agent'] || 'unknown'
    ]);
    
    // 4. 获取初始化后的统计信息
    const stats = await getDatabaseStats();
    
    res.json({
      success: true,
      message: '数据库初始化成功',
      stats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('数据库初始化失败:', error);
    res.status(500).json({
      success: false,
      message: '数据库初始化失败: ' + error.message
    });
  }
}

async function getDatabaseStats() {
  const stats = {};
  
  try {
    // 表统计
    const tableQueries = [
      { name: 'cdks', query: 'SELECT COUNT(*) as count FROM cdks' },
      { name: 'user_devices', query: 'SELECT COUNT(*) as count FROM user_devices' },
      { name: 'points_records', query: 'SELECT COUNT(*) as count FROM points_records' },
      { name: 'content_settings', query: 'SELECT COUNT(*) as count FROM content_settings' },
      { name: 'admin_logs', query: 'SELECT COUNT(*) as count FROM admin_logs' }
    ];
    
    for (const table of tableQueries) {
      try {
        const result = await DatabaseManager.query(table.query);
        stats[table.name] = parseInt(result.rows[0].count);
      } catch (error) {
        stats[table.name] = 0;
      }
    }
    
  } catch (error) {
    console.warn('无法获取数据库统计信息:', error.message);
    stats.error = error.message;
  }
  
  return stats;
}
