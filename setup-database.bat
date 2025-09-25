@echo off
echo 正在配置Vercel数据库...

echo.
echo === 第一步: 添加PostgreSQL数据库 ===
call vercel storage create postgres postgres-db --region iad1

echo.
echo === 第二步: 添加Redis KV数据库 ===
call vercel storage create kv redis-cache --region iad1

echo.
echo === 第三步: 拉取环境变量 ===
call vercel env pull .env.local

echo.
echo === 第四步: 重新部署 ===
call vercel --prod --force

echo.
echo ✅ 数据库配置完成！
echo 请检查 .env.local 文件确认环境变量已正确设置
pause
