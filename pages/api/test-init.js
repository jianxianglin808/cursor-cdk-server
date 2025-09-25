// 测试数据库初始化的简化版本（不需要认证）
import { DatabaseManager } from '../../lib/database.js';

export default async function handler(req, res) {
  try {
    // 测试基本连接
    const connectionTest = await DatabaseManager.query('SELECT NOW() as current_time');
    
    // 测试表存在性
    const tableTest = await DatabaseManager.query("SELECT COUNT(*) as count FROM information_schema.tables WHERE table_name = 'cdks'");
    const cdkTableExists = tableTest.rows[0].count > 0;
    
    res.json({
      success: true,
      message: 'Database connection test successful',
      details: {
        connection: 'OK',
        currentTime: connectionTest.rows[0].current_time,
        cdkTableExists,
        environment: {
          hasPostgres: !!process.env.POSTGRES_URL,
          hasRedis: !!process.env.KV_URL
        }
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error_type: error.constructor.name
    });
  }
}
