import Head from 'next/head'

export default function Home() {
  return (
    <>
      <Head>
        <title>Cursor CDK Server</title>
        <meta name="description" content="Cursor插件100%兼容云端服务器" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main style={{
        padding: '2rem',
        fontFamily: 'Arial, sans-serif',
        maxWidth: '800px',
        margin: '0 auto',
        lineHeight: '1.6'
      }}>
        <h1 style={{ color: '#0070f3', textAlign: 'center' }}>
          🚀 Cursor CDK Server
        </h1>
        
        <div style={{ 
          background: '#f9f9f9', 
          padding: '1.5rem', 
          borderRadius: '8px',
          margin: '2rem 0'
        }}>
          <h2>📊 服务器状态</h2>
          <p>✅ <strong>状态</strong>: 正常运行</p>
          <p>🌐 <strong>服务器地址</strong>: {typeof window !== 'undefined' ? window.location.origin : 'https://cursor-cdk-server.vercel.app'}</p>
          <p>🔧 <strong>管理后台</strong>: <a href="/admin" style={{color: '#0070f3'}}>点击进入</a></p>
        </div>

        <div style={{
          background: '#e6f7ff',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid #91d5ff'
        }}>
          <h2>🔌 API 端点</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>📍 <code>/api/get_settings</code> - 获取设置</li>
            <li>📍 <code>/api/activate</code> - CDK激活</li>
            <li>📍 <code>/api/get_points</code> - 获取积分</li>
            <li>📍 <code>/api/get_code</code> - 获取验证码</li>
            <li>📍 <code>/api/get_restore_code</code> - 获取恢复码</li>
            <li>📍 <code>/api/get_auth</code> - 获取授权</li>
            <li>📍 <code>/api/get_max_config</code> - 获取最大配置</li>
            <li>📍 <code>/api/toggle_magic_free_mode</code> - 切换免魔法模式</li>
            <li>📍 <code>/api/unbind_device</code> - 解绑设备</li>
          </ul>
        </div>

        <div style={{
          background: '#fff2e8',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid #ffd591',
          marginTop: '2rem'
        }}>
          <h2>🔑 管理功能</h2>
          <p>
            <strong>管理后台</strong>: <a href="/admin" style={{color: '#fa8c16'}}>访问管理后台</a>
          </p>
          <p>管理后台提供以下功能：</p>
          <ul>
            <li>🔐 密钥管理</li>
            <li>📝 内容编辑</li>
            <li>🗄️ 数据库管理</li>
            <li>📊 系统监控</li>
          </ul>
        </div>

        <footer style={{
          textAlign: 'center',
          marginTop: '3rem',
          padding: '2rem',
          borderTop: '1px solid #eee',
          color: '#666'
        }}>
          <p>Cursor CDK Server - 100%兼容云端服务器</p>
          <p>Powered by Next.js & Vercel</p>
        </footer>
      </main>
    </>
  )
}
