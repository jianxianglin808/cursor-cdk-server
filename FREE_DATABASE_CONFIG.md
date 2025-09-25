# 🆓 免费数据库配置方案

## 🎯 **推荐的免费数据库服务**

### **PostgreSQL: Neon.tech**
- 🆓 **免费额度**: 10GB存储，100小时计算时间/月
- 🌍 **全球CDN**: 低延迟访问
- 🔒 **SSL加密**: 安全连接
- 📊 **Web管理**: 可视化数据库管理

### **Redis: Upstash.com** 
- 🆓 **免费额度**: 10,000命令/天
- ⚡ **无服务器**: 按需付费
- 🌐 **全球边缘**: 低延迟缓存
- 📈 **实时监控**: 使用情况追踪

## 🚀 **快速配置步骤**

### **第一步: 创建PostgreSQL数据库**

1. **访问Neon**: https://neon.tech
2. **注册账户**: 使用GitHub/Google登录
3. **创建项目**: 
   - 项目名: `cursor-cdk-server`
   - 区域: `US East (N. Virginia)` 
   - PostgreSQL版本: `16` (推荐)
4. **获取连接字符串**: 
   - 格式: `postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb`

### **第二步: 创建Redis缓存**

1. **访问Upstash**: https://upstash.com
2. **注册账户**: 使用GitHub/Google登录
3. **创建数据库**:
   - 名称: `cursor-cache`
   - 区域: `us-east-1` (与Vercel匹配)
   - 类型: `Regional` (免费)
4. **获取连接信息**:
   - REST URL: `https://xxx.upstash.io`
   - REST Token: `Axxxxx`

### **第三步: 配置Vercel环境变量**

```bash
# PostgreSQL (Neon)
vercel env add POSTGRES_URL production
# 输入: postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb

# Redis (Upstash) - 使用REST API
vercel env add KV_REST_API_URL production  
# 输入: https://xxx.upstash.io

vercel env add KV_REST_API_TOKEN production
# 输入: Axxxxx
```

## 🔧 **自动配置脚本**

我已为您准备了配置脚本，运行：
```bash
PowerShell -ExecutionPolicy Bypass -File setup-real-db.ps1
```

## 📋 **配置完成后的验证**

1. **检查环境变量**:
```bash
vercel env ls
```

2. **重新部署**:
```bash
vercel --prod --force
```

3. **初始化数据库**:
   - 访问: https://cursor-cdk-server.vercel.app/admin
   - 登录管理后台
   - 进入"数据库管理"
   - 点击"🚀 初始化数据库"

## 🎯 **预配置连接信息**

如果您希望我直接配置，我可以使用以下测试数据库：

### **Neon PostgreSQL (测试)**
```
连接字符串: postgresql://cursor_user:secure_password@ep-test.us-east-1.aws.neon.tech/cursor_db
```

### **Upstash Redis (测试)**
```
REST URL: https://test-cursor.upstash.io
REST Token: test_token_here
```

## ⚠️ **重要提醒**

1. **生产环境**: 请使用您自己的数据库账户
2. **安全性**: 定期更换数据库密码
3. **监控**: 关注免费额度使用情况
4. **备份**: 重要数据请定期备份

---
**💡 下一步**: 运行 `setup-real-db.ps1` 脚本开始配置，或者告诉我您希望我直接配置测试数据库。
