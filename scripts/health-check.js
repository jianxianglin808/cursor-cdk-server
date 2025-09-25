#!/usr/bin/env node

import { DatabaseManager } from '../lib/database.js';
import { CRYPTO_CONFIG } from '../lib/constants.js';

/**
 * 数据库健康检查脚本
 * 用于验证数据库连接和服务状态
 */
async function performHealthCheck() {
  console.log('🏥 开始数据库健康检查...\n');
  
  const results = {
    postgres: { status: '❌', message: '', responseTime: 0 },
    redis: { status: '❌', message: '', responseTime: 0 },
    tables: { status: '❌', message: '', count: 0 },
    overall: { status: '❌', message: '' }
  };
  
  try {
    // 1. PostgreSQL连接测试
    console.log('🔍 检查PostgreSQL连接...');
    const pgStart = Date.now();
    
    try {
      const pgResult = await DatabaseManager.query('SELECT NOW() as current_time, version() as version');
      const pgTime = Date.now() - pgStart;
      
      results.postgres = {
        status: '✅',
        message: `连接正常 (${pgTime}ms)`,
        responseTime: pgTime,
        version: pgResult.rows[0].version.split(' ')[0] + ' ' + pgResult.rows[0].version.split(' ')[1]
      };
      console.log(`  ✅ PostgreSQL: ${results.postgres.message}`);
    } catch (error) {
      results.postgres = {
        status: '❌',
        message: `连接失败: ${error.message}`,
        responseTime: Date.now() - pgStart
      };
      console.log(`  ❌ PostgreSQL: ${results.postgres.message}`);
    }
    
    // 2. Redis连接测试
    console.log('🔍 检查Redis KV连接...');
    const redisStart = Date.now();
    
    try {
      const testKey = `health_check_${Date.now()}`;
      const testValue = { timestamp: Date.now(), test: true };
      
      await DatabaseManager.setCache(testKey, testValue, 10);
      const retrieved = await DatabaseManager.getCache(testKey);
      const redisTime = Date.now() - redisStart;
      
      if (retrieved && retrieved.test === true) {
        results.redis = {
          status: '✅',
          message: `连接正常 (${redisTime}ms)`,
          responseTime: redisTime
        };
        console.log(`  ✅ Redis KV: ${results.redis.message}`);
      } else {
        throw new Error('数据读写验证失败');
      }
    } catch (error) {
      results.redis = {
        status: '❌',
        message: `连接失败: ${error.message}`,
        responseTime: Date.now() - redisStart
      };
      console.log(`  ❌ Redis KV: ${results.redis.message}`);
    }
    
    // 3. 数据表检查
    console.log('🔍 检查数据表结构...');
    
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
      
      results.tables = {
        status: tableCount === 5 ? '✅' : '⚠️',
        message: `${tableCount}/5 个表存在`,
        count: tableCount
      };
      console.log(`  ${results.tables.status} 数据表: ${results.tables.message}`);
      
    } catch (error) {
      results.tables = {
        status: '❌',
        message: `表检查失败: ${error.message}`,
        count: 0
      };
      console.log(`  ❌ 数据表: ${results.tables.message}`);
    }
    
    // 4. 综合评估
    const allGood = results.postgres.status === '✅' && 
                   results.redis.status === '✅' && 
                   results.tables.status === '✅';
    
    results.overall = {
      status: allGood ? '✅' : '❌',
      message: allGood ? '所有服务正常' : '存在问题需要处理'
    };
    
    console.log('\n📊 健康检查报告:');
    console.log('================================================');
    console.log(`PostgreSQL:    ${results.postgres.status} ${results.postgres.message}`);
    console.log(`Redis KV:      ${results.redis.status} ${results.redis.message}`);
    console.log(`数据表:        ${results.tables.status} ${results.tables.message}`);
    console.log(`综合状态:      ${results.overall.status} ${results.overall.message}`);
    
    if (results.postgres.responseTime && results.redis.responseTime) {
      console.log(`\n⚡ 性能指标:`);
      console.log(`PostgreSQL响应时间: ${results.postgres.responseTime}ms`);
      console.log(`Redis响应时间:      ${results.redis.responseTime}ms`);
    }
    
    // 5. 配置信息检查
    console.log('\n🔧 配置信息检查:');
    console.log('================================================');
    console.log(`HMAC_KEY:      ${CRYPTO_CONFIG.HMAC_KEY ? '✅ 已配置' : '❌ 未配置'}`);
    console.log(`WEB_AES_KEY:   ${CRYPTO_CONFIG.WEB_AES_KEY ? '✅ 已配置' : '❌ 未配置'}`);
    console.log(`NODE_AES_KEY:  ${CRYPTO_CONFIG.NODE_AES_KEY ? '✅ 已配置' : '❌ 未配置'}`);
    console.log(`POSTGRES_URL:  ${process.env.POSTGRES_URL ? '✅ 已配置' : '❌ 未配置'}`);
    console.log(`KV_URL:        ${process.env.KV_URL ? '✅ 已配置' : '❌ 未配置'}`);
    
    if (!allGood) {
      console.log('\n🔧 问题解决建议:');
      if (results.postgres.status === '❌') {
        console.log('• PostgreSQL: 检查POSTGRES_URL环境变量和数据库连接');
      }
      if (results.redis.status === '❌') {
        console.log('• Redis KV: 检查KV_URL环境变量和Redis连接');
      }
      if (results.tables.status !== '✅') {
        console.log('• 数据表: 运行 npm run db:init 初始化数据库');
      }
      
      process.exit(1);
    } else {
      console.log('\n🎉 所有检查通过，服务器运行正常！');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('❌ 健康检查过程中发生错误:', error.message);
    console.error('\n🔧 请检查数据库配置和网络连接');
    process.exit(1);
  }
}

// 主程序入口
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🏥 Cursor服务器健康检查工具');
  console.log('================================================\n');
  
  performHealthCheck().catch(error => {
    console.error('💥 健康检查过程中发生错误:', error);
    process.exit(1);
  });
}
