/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // 环境变量
  env: {
    HMAC_KEY: process.env.HMAC_KEY,
    WEB_AES_KEY: process.env.WEB_AES_KEY,
    NODE_AES_KEY: process.env.NODE_AES_KEY,
  }
}

module.exports = nextConfig
