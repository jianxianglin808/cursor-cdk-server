export default function Custom404() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif',
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '4rem', margin: 0, color: '#666' }}>404</h1>
      <h2 style={{ color: '#999', marginBottom: '2rem' }}>页面未找到</h2>
      <p style={{ color: '#666', textAlign: 'center', marginBottom: '2rem' }}>
        您访问的页面不存在，请检查URL或返回首页。
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <a 
          href="/" 
          style={{
            padding: '0.75rem 1.5rem',
            background: '#0070f3',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px',
            fontWeight: 'bold'
          }}
        >
          返回首页
        </a>
        <a 
          href="/admin" 
          style={{
            padding: '0.75rem 1.5rem',
            background: '#f0f0f0',
            color: '#333',
            textDecoration: 'none',
            borderRadius: '5px',
            fontWeight: 'bold'
          }}
        >
          管理后台
        </a>
      </div>
    </div>
  )
}
