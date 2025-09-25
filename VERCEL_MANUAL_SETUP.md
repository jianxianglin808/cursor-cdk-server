# Vercel 手动配置指南

由于CLI交互式命令的限制，请按照以下步骤手动配置Vercel部署：

## 🚀 步骤1：通过Vercel网站部署

1. **访问Vercel网站**：https://vercel.com/
2. **登录您的账户**（已经在CLI中登录过）
3. **点击 "Add New..." → "Project"**
4. **选择 "Import Git Repository"**
5. **输入GitHub仓库URL**：`https://github.com/jianxianglin808/cursor-cdk-server`
6. **点击 "Import"**

## 🔧 步骤2：项目配置

在Vercel的项目配置页面：

### Framework Preset
- 选择：**Next.js**

### Root Directory  
- 保持默认：`./` (项目根目录)

### Build and Output Settings
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### Environment Variables
点击 "Environment Variables" 添加以下变量：

```
HMAC_KEY=9c5f66da591ea9f793959ec358abe1c14989d13642dcd92272e9f02a9811993e
WEB_AES_KEY=bcfd1f8dd31c6917b714b38dbf5c87e533831f1c151320a3b172ad082041b072
NODE_AES_KEY=b065e8b242c7b887a9e06618e37f7f3b4930f5804ec115d4410017214e04aeff
NODE_ENV=production
DOMAIN=cursor-cdk-server.vercel.app
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password_here
ADMIN_SESSION_SECRET=your_session_secret_here
```

**重要**：请修改 `ADMIN_PASSWORD` 和 `ADMIN_SESSION_SECRET` 为您自己的安全值！

## 📊 步骤3：获取项目配置信息

部署成功后，在Vercel项目设置页面：

1. **进入项目 Settings**
2. **找到 General 选项卡**
3. **记录以下信息**：

```
VERCEL_TOKEN: 
- 访问 https://vercel.com/account/tokens
- 创建新的Token
- 复制Token值

VERCEL_ORG_ID: 
- 在项目设置页面找到 "Team ID" 或 "Personal Account ID"
- 格式类似：team_abc123... 或 user_abc123...

VERCEL_PROJECT_ID:
- 在项目设置页面找到 "Project ID"  
- 格式类似：prj_abc123...
```

## 🔑 步骤4：设置GitHub Secrets

1. **访问GitHub仓库**：https://github.com/jianxianglin808/cursor-cdk-server
2. **进入 Settings → Secrets and variables → Actions**
3. **添加以下Secrets**：

```
VERCEL_TOKEN=您的Token值
VERCEL_ORG_ID=您的组织ID  
VERCEL_PROJECT_ID=您的项目ID
```

## 🗄️ 步骤5：配置数据库（重要！）

### Vercel Postgres
1. 在Vercel项目中点击 **Storage** 选项卡
2. 点击 **Create Database**
3. 选择 **Postgres**
4. 创建数据库后，Vercel会自动添加以下环境变量：
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL` 
   - `POSTGRES_URL_NON_POOLING`

### Vercel KV (Redis)
1. 同样在 **Storage** 选项卡
2. 点击 **Create Database**
3. 选择 **KV (Redis)**
4. 创建后会自动添加：
   - `KV_URL`
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`

## 🧪 步骤6：初始化数据库

数据库创建后，需要初始化表结构：

1. **在Vercel项目中进入 Functions 选项卡**
2. **或者使用本地脚本**：
```bash
npm run db:init
```

## ✅ 步骤7：验证部署

1. **访问您的服务器**：https://cursor-cdk-server.vercel.app/
2. **测试API端点**：
   - https://cursor-cdk-server.vercel.app/api/get_settings
   - https://cursor-cdk-server.vercel.app/api/activate
3. **访问管理后台**：https://cursor-cdk-server.vercel.app/admin
   - 用户名：admin
   - 密码：您设置的密码

## 🔧 故障排除

如果遇到问题：

1. **检查环境变量**：确保所有必需的环境变量都已设置
2. **查看部署日志**：在Vercel项目的 Deployments 选项卡中查看错误
3. **数据库连接**：确保数据库URL正确且可访问
4. **API测试**：使用Postman或curl测试API端点

## 📱 下一步

配置完成后：
1. GitHub Actions将自动处理后续部署
2. 每次推送到main分支都会触发生产部署
3. Pull Request会创建预览部署

部署完成后，请告诉我您获取到的三个配置值，我会帮您设置到GitHub Secrets中！
