// 基于🔍端到端API总结报告的完整密钥体系
export const CRYPTO_CONFIG = {
  // HMAC签名密钥 (所有端点通用)
  HMAC_KEY: process.env.HMAC_KEY || "9c5f66da591ea9f793959ec358abe1c14989d13642dcd92272e9f02a9811993e",
  
  // Web Crypto AES解密密钥 (前端响应解密)
  WEB_AES_KEY: process.env.WEB_AES_KEY || "bcfd1f8dd31c6917b714b38dbf5c87e533831f1c151320a3b172ad082041b072",
  
  // Node.js AES加密密钥 (后端数据加密)
  NODE_AES_KEY: process.env.NODE_AES_KEY || "b065e8b242c7b887a9e06618e37f7f3b4930f5804ec115d4410017214e04aeff"
};

// 业务配置
export const BUSINESS_CONFIG = {
  TIMESTAMP_OFFSET: 20000,  // 20秒偏移
  MAX_CONCURRENT: 50,       // 最大并发
  CDK_TYPES: {
    // Pro版 - 支持免魔法功能
    'DAYPRO': { duration: 1, accounts: 5, points: 500, magic_free: true, cursor_max: false },
    'WEEKPRO': { duration: 7, accounts: 35, points: 3500, magic_free: true, cursor_max: false },
    'MONTHPRO': { duration: 30, accounts: 150, points: 15000, magic_free: true, cursor_max: true },
    'QUARTERPRO': { duration: 90, accounts: 450, points: 45000, magic_free: true, cursor_max: true },
    'YEARPRO': { duration: 365, accounts: 1800, points: 180000, magic_free: true, cursor_max: true },
    
    // 普通版 - 不支持免魔法功能
    'DAY': { duration: 1, accounts: 5, points: 500, magic_free: false, cursor_max: false },
    'WEEK': { duration: 7, accounts: 35, points: 3500, magic_free: false, cursor_max: false },
    'MONTH': { duration: 30, accounts: 150, points: 15000, magic_free: false, cursor_max: true },
    'QUARTER': { duration: 90, accounts: 450, points: 45000, magic_free: false, cursor_max: true }
  },
  // 积分消耗规则
  POINTS_CONSUMPTION: {
    'ai_chat': 0,           // AI对话不扣分
    'account_switch': 100   // 无感换号100分/次
  }
};
