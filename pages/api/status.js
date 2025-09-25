// 简单的状态检查接口
export default function handler(req, res) {
  const status = {
    timestamp: new Date().toISOString(),
    status: 'OK',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    hasPostgres: !!process.env.POSTGRES_URL,
    hasRedis: !!process.env.KV_URL,
    deployment: {
      domain: req.headers.host,
      userAgent: req.headers['user-agent']
    }
  };

  res.json(status);
}
