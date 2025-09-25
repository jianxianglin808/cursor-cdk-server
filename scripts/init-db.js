#!/usr/bin/env node

import { DatabaseManager } from '../lib/database.js';
import { BUSINESS_CONFIG } from '../lib/constants.js';

/**
 * 数据库初始化脚本
 * 用于创建所有必需的表和索引
 */
async function initializeDatabase() {
  console.log('🗄️ 开始初始化Cursor服务器数据库...\n');
  
  try {
    // 1. 初始化数据库表结构
    console.log('📋 创建数据库表结构...');
    const result = await DatabaseManager.initDatabase();
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    console.log('✅ 数据库表结构创建成功\n');
    
    // 2. 插入默认内容配置
    console.log('📝 插入默认内容配置...');
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
      ON CONFLICT (id) DO NOTHING
    `, [JSON.stringify(defaultContent), 'system']);
    
    console.log('✅ 默认内容配置插入成功\n');
    
    // 3. 创建测试CDK数据（可选）
    console.log('🎫 创建测试CDK数据...');
    const testCDKs = [
      { code: 'WEEKPRO-TEST-0001-DEMO', type: 'WEEKPRO' },
      { code: 'MONTHPRO-TEST-0002-DEMO', type: 'MONTHPRO' },
      { code: 'DAY-TEST-0003-DEMO', type: 'DAY' }
    ];
    
    for (const cdk of testCDKs) {
      try {
        await DatabaseManager.query(`
          INSERT INTO cdks (cdk_code, cdk_type, status, created_at)
          VALUES ($1, $2, 'UNUSED', NOW())
          ON CONFLICT (cdk_code) DO NOTHING
        `, [cdk.code, cdk.type]);
        console.log(`  ✅ 测试CDK创建: ${cdk.code}`);
      } catch (error) {
        console.log(`  ⚠️ 测试CDK跳过: ${cdk.code} (可能已存在)`);
      }
    }
    
    console.log('\n🎉 数据库初始化完成！');
    console.log('\n📊 数据库统计信息:');
    
    // 4. 显示数据库统计
    const stats = await getDatabaseStats();
    console.table(stats);
    
    console.log('\n🚀 服务器已准备就绪，可以开始使用！');
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    console.error('\n🔧 解决建议:');
    console.error('1. 检查POSTGRES_URL环境变量是否正确配置');
    console.error('2. 确保数据库服务正在运行');
    console.error('3. 验证数据库连接权限');
    process.exit(1);
  }
}

/**
 * 获取数据库统计信息
 */
async function getDatabaseStats() {
  const stats = [];
  
  try {
    // CDK统计
    const cdkResult = await DatabaseManager.query('SELECT status, COUNT(*) as count FROM cdks GROUP BY status');
    for (const row of cdkResult.rows) {
      stats.push({ 表名: 'cdks', 状态: row.status, 数量: row.count });
    }
    
    // 设备统计
    const deviceResult = await DatabaseManager.query('SELECT COUNT(*) as count FROM user_devices');
    stats.push({ 表名: 'user_devices', 状态: 'total', 数量: deviceResult.rows[0].count });
    
    // 积分记录统计
    const pointsResult = await DatabaseManager.query('SELECT COUNT(*) as count FROM points_records');
    stats.push({ 表名: 'points_records', 状态: 'total', 数量: pointsResult.rows[0].count });
    
    // 内容设置统计
    const contentResult = await DatabaseManager.query('SELECT COUNT(*) as count FROM content_settings');
    stats.push({ 表名: 'content_settings', 状态: 'total', 数量: contentResult.rows[0].count });
    
  } catch (error) {
    console.warn('⚠️ 无法获取数据库统计信息:', error.message);
  }
  
  return stats;
}

/**
 * 显示CDK类型配置信息
 */
function showCDKTypeInfo() {
  console.log('\n📋 CDK类型配置信息:');
  console.table(BUSINESS_CONFIG.CDK_TYPES);
  
  console.log('\n💰 积分消耗规则:');
  console.table(BUSINESS_CONFIG.POINTS_CONSUMPTION);
}

// 主程序入口
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🔧 Cursor服务器数据库初始化工具');
  console.log('================================================\n');
  
  // 显示CDK配置信息
  showCDKTypeInfo();
  
  // 开始初始化
  initializeDatabase().catch(error => {
    console.error('💥 初始化过程中发生错误:', error);
    process.exit(1);
  });
}
