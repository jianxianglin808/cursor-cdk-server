# PowerShell脚本自动设置Vercel环境变量

Write-Host "🔧 设置Vercel环境变量..." -ForegroundColor Cyan

# 环境变量定义
$envVars = @{
    "WEB_AES_KEY" = "bcfd1f8dd31c6917b714b38dbf5c87e533831f1c151320a3b172ad082041b072"
    "NODE_AES_KEY" = "b065e8b242c7b887a9e06618e37f7f3b4930f5804ec115d4410017214e04aeff"
    "ADMIN_PASSWORD" = "CursorServer2024!"
}

# 临时数据库URL (使用SQLite作为临时方案)
$tempDB = @{
    "POSTGRES_URL" = "postgres://temp:temp@localhost:5432/temp"
    "KV_URL" = "redis://temp:temp@localhost:6379"
}

Write-Host "📝 设置核心环境变量..." -ForegroundColor Yellow

foreach ($var in $envVars.GetEnumerator()) {
    Write-Host "设置 $($var.Key)..." -ForegroundColor Green
    $var.Value | vercel env add $var.Key production
}

Write-Host "🗄️ 设置临时数据库URL..." -ForegroundColor Yellow

foreach ($var in $tempDB.GetEnumerator()) {
    Write-Host "设置 $($var.Key)..." -ForegroundColor Green  
    $var.Value | vercel env add $var.Key production
}

Write-Host "✅ 环境变量设置完成!" -ForegroundColor Green
Write-Host "🚀 重新部署中..." -ForegroundColor Cyan

# 重新部署
vercel --prod --force

Write-Host "🎉 部署完成!" -ForegroundColor Green
Write-Host "访问: https://cursor-cdk-server.vercel.app/admin" -ForegroundColor Blue
