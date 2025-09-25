# 🗄️ 真实数据库配置指南

## 🚨 **临时数据库问题**
当前使用的内存数据库会在重启时丢失所有数据，这不适合生产环境。

## 🎯 **解决方案选择**

### **方案1: Vercel内置数据库 (推荐)**

#### **通过Vercel Dashboard配置**
1. 访问 https://vercel.com/dashboard
2. 选择项目 `cursor-cdk-server`
3. 点击 `Storage` 选项卡
4. 创建数据库：

**PostgreSQL数据库**:
- 点击 `Create Database`
- 选择 `Postgres`
- 名称: `cursor-postgres`
- 区域: `Washington, D.C. (iad1)`

**Redis KV数据库**:
- 点击 `Create Database`  
- 选择 `KV`
- 名称: `cursor-kv`
- 区域: `Washington, D.C. (iad1)`

5. 创建后，点击 `Connect to Project`
6. 选择 `cursor-cdk-server` 项目
7. 环境变量会自动添加

### **方案2: 免费外部数据库服务**

#### **PostgreSQL - Neon (推荐)**
- 网址: https://neon.tech
- 免费额度: 10GB存储，100小时计算时间/月
- 连接格式: `postgresql://user:password@hostname/dbname`

#### **PostgreSQL - Supabase**
- 网址: https://supabase.com
- 免费额度: 500MB数据库，50MB文件存储
- 连接格式: `postgresql://postgres:password@hostname:5432/postgres`

#### **Redis - Upstash**
- 网址: https://upstash.com
- 免费额度: 10,000命令/天
- 连接格式: `redis://user:password@hostname:port`

### **方案3: Railway (一站式解决方案)**
- 网址: https://railway.app
- 免费额度: $5/月使用额度
- 同时提供PostgreSQL和Redis

## 🔧 **配置步骤 (以Neon为例)**

### **1. 创建PostgreSQL数据库**
```bash
# 1. 访问 https://neon.tech 注册账户
# 2. 创建新项目: cursor-cdk-db
# 3. 复制连接字符串
# 4. 设置环境变量
vercel env add POSTGRES_URL
# 粘贴连接字符串: postgresql://user:password@hostname/dbname
```

### **2. 创建Redis缓存**
```bash
# 1. 访问 https://upstash.com 注册账户  
# 2. 创建Redis数据库: cursor-cache
# 3. 复制连接字符串
# 4. 设置环境变量
vercel env add KV_URL
# 粘贴连接字符串: redis://user:password@hostname:port
```

### **3. 验证配置**
```bash
# 检查环境变量
vercel env ls

# 重新部署
vercel --prod --force
```

## 🚀 **自动化配置脚本**

创建 `setup-real-db.ps1`:
```powershell
Write-Host "🗄️ 配置真实数据库..." -ForegroundColor Cyan

# Neon PostgreSQL (免费)
$postgresUrl = Read-Host "请输入PostgreSQL连接字符串 (从Neon获取)"
$postgresUrl | vercel env add POSTGRES_URL production

# Upstash Redis (免费)  
$redisUrl = Read-Host "请输入Redis连接字符串 (从Upstash获取)"
$redisUrl | vercel env add KV_URL production

Write-Host "✅ 数据库配置完成!" -ForegroundColor Green
Write-Host "🚀 重新部署..." -ForegroundColor Yellow

vercel --prod --force
```

## 📋 **数据库初始化**

部署完成后：
1. 访问管理后台: https://cursor-cdk-server.vercel.app/admin
2. 登录账户 (admin/CursorServer2024!)
3. 进入 `数据库管理` 页面
4. 点击 `🚀 初始化数据库` 按钮
5. 确认所有表创建成功

## ⚠️ **重要注意事项**

1. **备份数据**: 生产环境请定期备份数据库
2. **安全配置**: 使用强密码和SSL连接
3. **监控使用**: 关注免费额度使用情况
4. **性能优化**: 根据使用情况调整数据库配置

## 🔍 **故障排除**

### **常见错误**
- `connection refused`: 检查数据库服务是否启动
- `authentication failed`: 验证用户名密码正确性
- `database not found`: 确认数据库名称正确

### **测试连接**
```javascript
// 在Vercel Function中测试
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    const result = await sql`SELECT NOW()`;
    res.json({ success: true, time: result.rows[0].now });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
}
```

---
**💡 建议**: 优先使用Vercel内置数据库，性能和集成度最佳。如果不可用，Neon + Upstash是很好的免费替代方案。
