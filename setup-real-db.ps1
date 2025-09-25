# 配置真实数据库的PowerShell脚本

Write-Host "🗄️ 配置真实数据库环境..." -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 需要准备的数据库连接信息:" -ForegroundColor Yellow
Write-Host "1. PostgreSQL (推荐使用 Neon.tech 免费版)"
Write-Host "2. Redis (推荐使用 Upstash.com 免费版)"
Write-Host ""

Write-Host "🔗 快速注册链接:" -ForegroundColor Green
Write-Host "PostgreSQL: https://neon.tech (免费10GB)"
Write-Host "Redis: https://upstash.com (免费10K命令/天)"
Write-Host ""

# 询问是否已准备好连接信息
$ready = Read-Host "是否已准备好数据库连接信息? (y/n)"

if ($ready -eq "y" -or $ready -eq "Y") {
    Write-Host ""
    Write-Host "🐘 配置PostgreSQL..." -ForegroundColor Blue
    
    # PostgreSQL配置
    Write-Host "请输入PostgreSQL连接字符串"
    Write-Host "格式: postgresql://user:password@hostname:5432/database"
    $postgresUrl = Read-Host "POSTGRES_URL"
    
    if ($postgresUrl -ne "") {
        Write-Host "设置PostgreSQL环境变量..." -ForegroundColor Green
        $postgresUrl | vercel env add POSTGRES_URL production
    }
    
    Write-Host ""
    Write-Host "🔴 配置Redis..." -ForegroundColor Red
    
    # Redis配置  
    Write-Host "请输入Redis连接字符串"
    Write-Host "格式: redis://user:password@hostname:port"
    $redisUrl = Read-Host "KV_URL"
    
    if ($redisUrl -ne "") {
        Write-Host "设置Redis环境变量..." -ForegroundColor Green
        $redisUrl | vercel env add KV_URL production
    }
    
    Write-Host ""
    Write-Host "✅ 数据库配置完成!" -ForegroundColor Green
    
    # 显示当前环境变量
    Write-Host ""
    Write-Host "📋 当前环境变量:" -ForegroundColor Cyan
    vercel env ls
    
    Write-Host ""
    Write-Host "🚀 重新部署应用..." -ForegroundColor Yellow
    vercel --prod --force
    
    Write-Host ""
    Write-Host "🎉 部署完成!" -ForegroundColor Green
    Write-Host "请访问管理后台初始化数据库: https://cursor-cdk-server.vercel.app/admin" -ForegroundColor Blue
    
} else {
    Write-Host ""
    Write-Host "📝 请按照以下步骤准备数据库:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. PostgreSQL (Neon):"
    Write-Host "   - 访问 https://neon.tech"
    Write-Host "   - 注册免费账户"
    Write-Host "   - 创建新项目: cursor-db"
    Write-Host "   - 复制连接字符串"
    Write-Host ""
    Write-Host "2. Redis (Upstash):"
    Write-Host "   - 访问 https://upstash.com"  
    Write-Host "   - 注册免费账户"
    Write-Host "   - 创建Redis数据库: cursor-cache"
    Write-Host "   - 复制连接字符串"
    Write-Host ""
    Write-Host "准备好后重新运行此脚本: PowerShell -ExecutionPolicy Bypass -File setup-real-db.ps1"
}

Write-Host ""
Write-Host "💡 提示: 数据库配置完成后，记得在管理后台点击'初始化数据库'按钮" -ForegroundColor Cyan
