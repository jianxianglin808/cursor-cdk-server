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
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    // 验证管理员权限
    verifyAdmin(req);
    
    const status = {
      postgres: { status: 'checking', message: '', responseTime: 0 },
      redis: { status: 'checking', message: '', responseTime: 0 },
      tables: { status: 'checking', message: '', count: 0 },
      overall: { status: 'checking', message: '' }
    };
    
    // 1. PostgreSQL检查
    try {
      const pgStart = Date.now();
      const pgResult = await DatabaseManager.query('SELECT NOW() as current_time');
      const pgTime = Date.now() - pgStart;
      
      status.postgres = {
        status: 'healthy',
        message: `连接正常 (${pgTime}ms)`,
        responseTime: pgTime
      };
    } catch (error) {
      status.postgres = {
        status: 'error',
        message: `连接失败: ${error.message}`,
        responseTime: 0
      };
    }
    
    // 2. Redis检查
    try {
      const redisStart = Date.now();
      const testKey = `health_check_${Date.now()}`;
      const testValue = { timestamp: Date.now(), test: true };
      
      await DatabaseManager.setCache(testKey, testValue, 10);
      const retrieved = await DatabaseManager.getCache(testKey);
      const redisTime = Date.now() - redisStart;
      
      if (retrieved && retrieved.test === true) {
        status.redis = {
          status: 'healthy',
          message: `连接正常 (${redisTime}ms)`,
          responseTime: redisTime
        };
      } else {
        throw new Error('数据读写验证失败');
      }
    } catch (error) {
      status.redis = {
        status: 'error',
        message: `连接失败: ${error.message}`,
        responseTime: 0
      };
    }
    
    // 3. 表结构检查
    try {
      const tableQueries = [
        "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_name = 'cdks'",
        "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_name = 'user_devices'",
        "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_name = 'points_records'",
        "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_name = 'content_settings'",
        "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_name = 'admin_logs'"
      ];
      
      let tableCount = 0;
      for (const query of tableQueries) {
        const result = await DatabaseManager.query(query);
        if (result.rows[0].count > 0) {
          tableCount++;
        }
      }
      
      status.tables = {
        status: tableCount === 5 ? 'healthy' : 'warning',
        message: `${tableCount}/5 个表存在`,
        count: tableCount
      };
    } catch (error) {
      status.tables = {
        status: 'error',
        message: `表检查失败: ${error.message}`,
        count: 0
      };
    }
    
    // 4. 综合状态
    const allHealthy = status.postgres.status === 'healthy' && 
                      status.redis.status === 'healthy' && 
                      status.tables.status === 'healthy';
    
    status.overall = {
      status: allHealthy ? 'healthy' : 'error',
      message: allHealthy ? '所有服务正常' : '存在问题需要处理'
    };
    
    // 5. 获取数据统计
    const stats = await getDatabaseStats();
    
    res.json({
      success: true,
      status,
      stats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(403).json({
      success: false,
      message: error.message
    });
  }
}

async function getDatabaseStats() {
  const stats = {};
  
  try {
    // CDK统计
    const cdkResult = await DatabaseManager.query(`
      SELECT status, COUNT(*) as count 
      FROM cdks 
      GROUP BY status
    `);
    stats.cdks = cdkResult.rows.reduce((acc, row) => {
      acc[row.status] = parseInt(row.count);
      return acc;
    }, {});
    
    // 设备统计
    const deviceResult = await DatabaseManager.query(`
      SELECT COUNT(*) as total,
             COUNT(CASE WHEN is_active = true THEN 1 END) as active
      FROM user_devices
    `);
    stats.devices = {
      total: parseInt(deviceResult.rows[0].total),
      active: parseInt(deviceResult.rows[0].active)
    };
    
    // 积分记录统计
    const pointsResult = await DatabaseManager.query(`
      SELECT COUNT(*) as total,
             AVG(points_balance) as avg_balance
      FROM points_records
    `);
    stats.points = {
      total: parseInt(pointsResult.rows[0].total),
      avgBalance: Math.round(parseFloat(pointsResult.rows[0].avg_balance) || 0)
    };
    
  } catch (error) {
    console.warn('无法获取数据库统计信息:', error.message);
    stats.error = error.message;
  }
  
  return stats;
}
