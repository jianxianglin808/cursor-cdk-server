@echo off
echo 配置Vercel环境变量...

:: 基础密钥
echo 9c5f66da591ea9f793959ec358abe1c14989d13642dcd92272e9f02a9811993e | vercel env add HMAC_KEY production --stdin
echo bcfd1f8dd31c6917b714b38dbf5c87e533831f1c151320a3b172ad082041b072 | vercel env add WEB_AES_KEY production --stdin  
echo b065e8b242c7b887a9e06618e37f7f3b4930f5804ec115d4410017214e04aeff | vercel env add NODE_AES_KEY production --stdin

:: 环境配置
echo production | vercel env add NODE_ENV production --stdin
echo cursor-cdk-server.vercel.app | vercel env add DOMAIN production --stdin

:: 管理员配置
echo admin | vercel env add ADMIN_USERNAME production --stdin
echo CursorServer2024! | vercel env add ADMIN_PASSWORD production --stdin
echo cursor_session_secret_2024_secure | vercel env add ADMIN_SESSION_SECRET production --stdin

echo 环境变量配置完成！
echo 开始部署到生产环境...
vercel --prod --yes

echo 部署完成！
echo 服务器地址: https://cursor-cdk-server.vercel.app/
echo 管理后台: https://cursor-cdk-server.vercel.app/admin
pause
