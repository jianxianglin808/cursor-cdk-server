# GitHub Secrets 设置指南

为了让GitHub Actions工作流正常运行，您需要在GitHub仓库中设置以下Secrets。

## 🔧 设置步骤

1. 访问您的GitHub仓库：https://github.com/jianxianglin808/cursor-cdk-server
2. 点击 **Settings** 选项卡
3. 在左侧菜单中选择 **Secrets and variables** > **Actions**
4. 点击 **New repository secret** 按钮

## 📋 必需的Secrets

### Vercel部署相关
```
VERCEL_TOKEN
- 描述: Vercel API Token
- 获取方式: https://vercel.com/account/tokens
- 示例: vercel_1234567890abcdef...

VERCEL_ORG_ID  
- 描述: Vercel组织ID
- 获取方式: Vercel项目设置页面
- 示例: team_abc123def456...

VERCEL_PROJECT_ID
- 描述: Vercel项目ID  
- 获取方式: Vercel项目设置页面
- 示例: prj_abc123def456...
```

### 测试数据库相关 (可选)
```
TEST_POSTGRES_URL
- 描述: 测试用PostgreSQL数据库URL
- 示例: postgres://user:pass@host:5432/testdb

TEST_KV_URL
- 描述: 测试用Redis数据库URL
- 示例: redis://user:pass@host:6379
```

## 🚀 获取Vercel配置信息

### 1. 获取Vercel Token
1. 访问 https://vercel.com/account/tokens
2. 点击 **Create Token**
3. 输入Token名称（如：cursor-cdk-server-ci）
4. 选择作用域和过期时间
5. 复制生成的Token

### 2. 获取组织ID和项目ID
1. 访问您的Vercel项目面板
2. 选择项目 **cursor-cdk-server**
3. 进入 **Settings** > **General**
4. 在页面底部找到：
   - **Project ID**: `prj_...`
   - **Team ID** (如果是团队项目): `team_...`

### 3. 通过Vercel CLI获取（推荐）
```bash
# 安装Vercel CLI
npm i -g vercel

# 登录
vercel login

# 在项目目录中运行
vercel link

# 查看项目信息
vercel ls
```

## ✅ 验证设置

设置完成后，GitHub Actions将能够：
- ✅ 自动部署预览版本（Pull Request）
- ✅ 自动部署生产版本（Push到main分支）
- ✅ 运行安全扫描和代码检查
- ✅ 数据库健康检查（如果配置了测试数据库）

## 🔍 故障排除

如果GitHub Actions失败，请检查：
1. 所有必需的Secrets是否已正确设置
2. Vercel Token是否有效且具有足够权限
3. 项目ID和组织ID是否正确
4. 网络连接是否正常

## 📚 相关文档

- [Vercel CLI文档](https://vercel.com/docs/cli)
- [GitHub Actions文档](https://docs.github.com/en/actions)
- [Vercel部署文档](https://vercel.com/docs/deployments)
