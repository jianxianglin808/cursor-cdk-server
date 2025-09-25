# 🗄️ 数据库配置指南

## 🔍 **问题分析**
管理后台显示数据库连接错误：
```
VercelPostgresError - 'missing_connection_string': You did not supply a 'connectionString' and no 'POSTGRES_URL' env var was found.
```

## 🛠️ **解决方案**

### **方案1: 使用Vercel内置数据库 (推荐)**

#### **1. 创建PostgreSQL数据库**
1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 进入项目 `cursor-cdk-server`
3. 点击 `Storage` 选项卡
4. 点击 `Create Database`
5. 选择 `Postgres` 
6. 命名为 `cursor-postgres`
7. 选择区域 `Washington, D.C. (iad1)`

#### **2. 创建Redis KV数据库**
1. 在同一个Storage页面
2. 点击 `Create Database`
3. 选择 `KV` (Redis)
4. 命名为 `cursor-kv`
5. 选择区域 `Washington, D.C. (iad1)`

#### **3. 连接数据库到项目**
1. 创建后，点击每个数据库
2. 点击 `Connect Project`
3. 选择 `cursor-cdk-server` 项目
4. 环境变量会自动添加

### **方案2: 手动设置环境变量**

如果无法创建内置数据库，可以使用外部数据库：

#### **设置PostgreSQL**
```bash
vercel env add POSTGRES_URL
# 输入: postgresql://username:password@hostname:5432/database_name
```

#### **设置Redis KV**
```bash
vercel env add KV_URL
# 输入: redis://username:password@hostname:6379
```

#### **设置其他必需环境变量**
```bash
# Web AES密钥
vercel env add WEB_AES_KEY
# 输入: bcfd1f8dd31c6917b714b38dbf5c87e533831f1c151320a3b172ad082041b072

# Node AES密钥  
vercel env add NODE_AES_KEY
# 输入: b065e8b242c7b887a9e06618e37f7f3b4930f5804ec115d4410017214e04aeff

# 管理员密码
vercel env add ADMIN_PASSWORD
# 输入: CursorServer2024!
```

### **方案3: 使用免费外部数据库**

#### **PostgreSQL (ElephantSQL免费版)**
1. 访问 [ElephantSQL](https://www.elephantsql.com)
2. 注册免费账户
3. 创建新实例
4. 复制连接字符串
5. 格式: `postgres://user:pass@hostname/dbname`

#### **Redis (Redis Cloud免费版)**
1. 访问 [Redis Cloud](https://app.redislabs.com)
2. 注册免费账户
3. 创建新数据库
4. 复制连接字符串
5. 格式: `redis://user:pass@hostname:port`

## 🚀 **部署流程**

### **完成配置后重新部署**
```bash
# 拉取最新环境变量
vercel env pull .env.local

# 重新部署
vercel --prod --force

# 或者触发新的部署
vercel deploy --prod
```

### **验证配置**
部署完成后访问管理后台：
1. 访问 https://cursor-cdk-server.vercel.app/admin
2. 使用默认账号登录：
   - 用户名: `admin`
   - 密码: `CursorServer2024!`
3. 检查数据库管理页面是否正常

## 📋 **必需环境变量清单**

| 变量名 | 用途 | 示例值 |
|--------|------|--------|
| `POSTGRES_URL` | PostgreSQL数据库 | `postgres://user:pass@host:5432/db` |
| `KV_URL` | Redis缓存 | `redis://user:pass@host:6379` |
| `HMAC_KEY` | 签名验证 | `9c5f66da591ea9f793959ec358abe1c1...` |
| `WEB_AES_KEY` | 前端加密 | `bcfd1f8dd31c6917b714b38dbf5c87e5...` |
| `NODE_AES_KEY` | 后端加密 | `b065e8b242c7b887a9e06618e37f7f3b...` |
| `ADMIN_PASSWORD` | 管理员密码 | `CursorServer2024!` |

## 🔧 **故障排除**

### **常见错误**
1. **连接字符串格式错误**: 确保URL格式正确
2. **数据库未创建**: 确保数据库表已初始化
3. **权限问题**: 确保数据库用户有足够权限
4. **网络问题**: 确保Vercel能访问外部数据库

### **调试步骤**
1. 检查环境变量是否正确设置
2. 使用数据库管理页面的"初始化数据库"功能
3. 查看Vercel的Function日志
4. 检查数据库连接字符串格式

---
**💡 提示**: 建议使用Vercel内置数据库，它们与Vercel平台集成良好，性能和可靠性都有保障。
