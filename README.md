# 🚀 Cursor插件100%兼容云端服务器

基于端到端API总结报告和NONCE机制完全破解报告的精确数据，确保与extension.js插件100%兼容的Vercel云端服务器实现。

## 📋 **项目概述**

这是一个完整的、可直接部署的Cursor插件服务器，提供：

- ✅ **9个核心API端点** - 100%匹配原版参数和响应格式
- ✅ **三密钥体系** - HMAC签名 + AES-CBC-256加密 + Node.js AES-CTR-256
- ✅ **CDK激活系统** - 支持8种CDK类型，Pro版免魔法功能
- ✅ **设备绑定管理** - 每个CDK最多绑定2台设备
- ✅ **积分系统** - 完整的积分查询和消耗机制
- ✅ **管理后台** - 密钥管理和内容编辑功能
- ✅ **Vercel部署** - Serverless架构，自动扩容

## 🌐 **在线演示**

- **服务器地址**: [https://cursor-cdk-server.vercel.app/](https://cursor-cdk-server.vercel.app/)
- **管理后台**: [https://cursor-cdk-server.vercel.app/admin](https://cursor-cdk-server.vercel.app/admin)

## 🔐 **安全特性**

### **三密钥体系**
```bash
HMAC_KEY    # HMAC-SHA256签名验证 (所有端点通用)
WEB_AES_KEY # AES-CBC-256响应解密 (前端使用)
NODE_AES_KEY # AES-CTR-256数据加密 (后端使用)
```

### **多层安全保护**
- 🔏 **签名验证**: HMAC-SHA256防篡改
- 🔐 **数据加密**: AES-CBC-256响应加密
- ⏰ **时间戳验证**: 20秒偏移防重放
- 🛡️ **权限控制**: CDK类型权限分级
- 📊 **缓存防护**: Redis签名防重放

## 🎯 **CDK类型支持**

| CDK类型 | 时长 | 账号数 | 积分 | 免魔法 | CursorMax |
|---------|------|--------|------|--------|-----------|
| **DAYPRO** | 1天 | 5个 | 500 | ✅ | ❌ |
| **WEEKPRO** | 7天 | 35个 | 3500 | ✅ | ❌ |
| **MONTHPRO** | 30天 | 150个 | 15000 | ✅ | ✅ |
| **QUARTERPRO** | 90天 | 450个 | 45000 | ✅ | ✅ |
| **YEARPRO** | 365天 | 1800个 | 180000 | ✅ | ✅ |
| **DAY** | 1天 | 5个 | 500 | ❌ | ❌ |
| **WEEK** | 7天 | 35个 | 3500 | ❌ | ❌ |
| **MONTH** | 30天 | 150个 | 15000 | ❌ | ✅ |
| **QUARTER** | 90天 | 450个 | 45000 | ❌ | ✅ |

## 🌐 **API端点清单**

| 端点 | 功能 | 协议 | 状态 |
|------|------|------|------|
| `/api/get_settings` | 系统设置获取 | HTTPS | ✅ |
| `/api/activate` | CDK激活 | HTTPS | ✅ |
| `/api/get_points` | 积分查询 | HTTPS | ✅ |
| `/api/get_code` | 文件哈希验证 | HTTPS | ✅ |
| `/api/get_restore_code` | 停用插件 | HTTPS | ✅ |
| `/api/unbind_device` | 解绑设备 | HTTPS | ✅ |
| `/api/toggle_magic_free_mode` | 免魔法切换 | HTTPS | ✅ |
| `/api/get_max_config` | CursorMax配置 | HTTPS | ✅ |
| `/api/get_auth` | AI对话授权 | HTTP | ✅ |

## 🚀 **快速开始**

### **1. 克隆项目**
```bash
git clone https://github.com/yourusername/cursor-server-vercel.git
cd cursor-server-vercel
```

### **2. 安装依赖**
```bash
npm install
```

### **3. 配置环境变量**
```bash
cp env.example .env.local
# 编辑 .env.local 配置你的密钥和数据库连接
```

### **4. 初始化数据库**
```bash
npm run db:init
```

### **5. 启动开发服务器**
```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看服务器状态。

## 📦 **Vercel部署**

### **一键部署**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/cursor-server-vercel)

### **手动部署**

1. **Fork 本仓库**
2. **登录 [Vercel Dashboard](https://vercel.com/dashboard)**
3. **导入 GitHub 项目**
4. **配置环境变量**:
   ```bash
   HMAC_KEY=9c5f66da591ea9f793959ec358abe1c14989d13642dcd92272e9f02a9811993e
   WEB_AES_KEY=bcfd1f8dd31c6917b714b38dbf5c87e533831f1c151320a3b172ad082041b072
   NODE_AES_KEY=b065e8b242c7b887a9e06618e37f7f3b4930f5804ec115d4410017214e04aeff
   POSTGRES_URL=your_postgres_connection_string
   KV_URL=your_redis_connection_string
   ```
5. **部署完成**

## 🗄️ **数据库配置**

### **Vercel Postgres**
```bash
# 添加 PostgreSQL 数据库
vercel env add POSTGRES_URL
```

### **Vercel KV Redis**
```bash
# 添加 Redis 缓存
vercel env add KV_URL
```

### **数据库管理**
```bash
# 数据库初始化
npm run db:init

# 健康状态检查
npm run db:health

# 完整数据库设置
npm run db:setup
```

## 🔧 **管理后台**

访问 `/admin` 路径使用管理后台：

### **功能特性**
- 🔐 **密钥管理**: 修改三密钥体系
- 📝 **内容编辑**: 编辑广告和提示内容
- 📊 **数据库状态**: 实时监控数据库健康
- 🔄 **系统初始化**: Web端数据库初始化

### **默认登录**
- **用户名**: `admin`
- **密码**: `admin123456`

> ⚠️ **安全提醒**: 生产环境请修改默认密码！

## 🧪 **测试验证**

### **API端点测试**
```bash
# 测试所有端点
node scripts/test-endpoints.js
```

### **数据库健康检查**
```bash
npm run db:health
```

### **签名验证测试**
```javascript
// 使用相同的签名算法验证兼容性
const params = { cdk: 'TEST-1234', timestamp: Date.now() };
const signature = generateSignature(params);
```

## 📊 **项目结构**

```
cursor-server-vercel/
├── 📁 components/admin/     # 管理后台组件
├── 📁 lib/                  # 核心业务逻辑
├── 📁 pages/api/            # API端点
├── 📁 public/               # 静态资源
├── 📁 scripts/              # 管理脚本
├── 📄 package.json          # 项目依赖
├── 📄 vercel.json           # Vercel配置
├── 📄 next.config.js        # Next.js配置
└── 📄 README.md             # 项目文档
```

## 🔍 **核心文件说明**

### **加密算法实现**
- `lib/signature.js` - HMAC-SHA256签名算法
- `lib/nonce.js` - NONCE生成和AES加密
- `lib/constants.js` - 三密钥体系配置

### **业务逻辑**
- `lib/cdk-manager.js` - CDK管理和权限验证
- `lib/database.js` - 数据库操作和缓存

### **API端点**
- `pages/api/*.js` - 9个核心API端点
- `pages/api/admin/*.js` - 管理后台API

## ⚡ **性能指标**

| 指标 | 数值 | 说明 |
|------|------|------|
| **响应时间** | < 1.5s | 大部分API端点 |
| **并发支持** | 50+ | 可配置限制 |
| **数据库查询** | < 100ms | PostgreSQL平均 |
| **缓存命中** | > 90% | Redis缓存 |
| **可用性** | 99.9% | Vercel SLA |

## 🛡️ **安全最佳实践**

### **密钥管理**
- 🔐 定期更新三密钥体系
- 🔒 使用环境变量存储敏感信息
- 🛡️ 启用Vercel环境变量加密

### **访问控制**
- 🔑 管理后台JWT认证
- ⏰ 请求时间戳验证
- 🚫 签名防重放攻击

### **数据保护**
- 🔐 AES-256加密传输
- 📊 操作日志记录
- 🗄️ 数据库访问控制

## 🔄 **版本更新**

### **更新流程**
1. Fork 最新版本
2. 合并自定义修改
3. 更新环境变量
4. 重新部署到Vercel

### **版本历史**
- **v1.0.0** - 初始版本，100%兼容实现
- **v1.1.0** - 管理后台功能
- **v1.2.0** - 数据库优化

## 🤝 **贡献指南**

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 **许可证**

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🆘 **技术支持**

### **常见问题**
- **Q**: 如何修改服务器地址？
- **A**: 修改客户端配置中的服务器URL即可

- **Q**: CDK激活失败怎么办？
- **A**: 检查CDK格式和数据库连接状态

- **Q**: 如何自定义CDK类型？
- **A**: 修改 `lib/constants.js` 中的 `CDK_TYPES` 配置

### **联系方式**
- 📧 **邮箱**: support@example.com
- 💬 **讨论**: GitHub Issues
- 📚 **文档**: [Wiki页面](https://github.com/yourusername/cursor-server-vercel/wiki)

---

**🎉 感谢使用 Cursor插件100%兼容云端服务器！**

> 基于端到端API总结报告和NONCE机制完全破解报告的精确数据实现，确保与原版插件完美兼容。
