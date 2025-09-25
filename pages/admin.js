import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    // 检查是否已登录
    const token = localStorage.getItem('admin_token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm),
      });

      const data = await response.json();
      if (data.success) {
        localStorage.setItem('admin_token', data.token);
        setIsLoggedIn(true);
        setMessage('登录成功！');
      } else {
        setMessage('登录失败: ' + data.message);
      }
    } catch (error) {
      setMessage('登录失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsLoggedIn(false);
    setCurrentView('dashboard');
  };

  if (!isLoggedIn) {
    return (
      <>
        <Head>
          <title>管理后台 - Cursor CDK Server</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          fontFamily: 'Arial, sans-serif'
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            width: '400px',
            maxWidth: '90vw'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h1 style={{ color: '#333', marginBottom: '0.5rem' }}>🔐 管理后台</h1>
              <p style={{ color: '#666', fontSize: '14px' }}>Cursor CDK Server</p>
            </div>

            {message && (
              <div style={{
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '1rem',
                backgroundColor: message.includes('成功') ? '#d4edda' : '#f8d7da',
                color: message.includes('成功') ? '#155724' : '#721c24',
                border: `1px solid ${message.includes('成功') ? '#c3e6cb' : '#f5c6cb'}`
              }}>
                {message}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333' }}>
                  用户名
                </label>
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="请输入用户名"
                  required
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333' }}>
                  密码
                </label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="请输入密码"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: loading ? '#ccc' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {loading ? '登录中...' : '登录'}
              </button>
            </form>

            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: '#f8f9fa',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#666'
            }}>
              <p style={{ margin: '0 0 0.5rem 0' }}><strong>默认登录信息：</strong></p>
              <p style={{ margin: '0' }}>用户名：admin</p>
              <p style={{ margin: '0' }}>密码：CursorServer2024!</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>管理后台 - Cursor CDK Server</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={{
        minHeight: '100vh',
        background: '#f5f5f5',
        fontFamily: 'Arial, sans-serif'
      }}>
        {/* 顶部导航栏 */}
        <div style={{
          background: 'white',
          borderBottom: '1px solid #e0e0e0',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ margin: 0, color: '#333' }}>🚀 Cursor CDK Server 管理后台</h1>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            退出登录
          </button>
        </div>

        {/* 侧边栏和内容区域 */}
        <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)' }}>
          {/* 侧边栏 */}
          <div style={{
            width: '250px',
            background: 'white',
            borderRight: '1px solid #e0e0e0',
            padding: '1rem'
          }}>
            <nav>
              <div
                onClick={() => setCurrentView('dashboard')}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  background: currentView === 'dashboard' ? '#007bff' : 'transparent',
                  color: currentView === 'dashboard' ? 'white' : '#333'
                }}
              >
                📊 仪表板
              </div>
              <div
                onClick={() => setCurrentView('keys')}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  background: currentView === 'keys' ? '#007bff' : 'transparent',
                  color: currentView === 'keys' ? 'white' : '#333'
                }}
              >
                🔐 密钥管理
              </div>
              <div
                onClick={() => setCurrentView('content')}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  background: currentView === 'content' ? '#007bff' : 'transparent',
                  color: currentView === 'content' ? 'white' : '#333'
                }}
              >
                📝 内容管理
              </div>
              <div
                onClick={() => setCurrentView('database')}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  background: currentView === 'database' ? '#007bff' : 'transparent',
                  color: currentView === 'database' ? 'white' : '#333'
                }}
              >
                🗄️ 数据库管理
              </div>
            </nav>
          </div>

          {/* 主内容区域 */}
          <div style={{ flex: 1, padding: '2rem' }}>
            {currentView === 'dashboard' && (
              <div>
                <h2 style={{ color: '#333', marginBottom: '1.5rem' }}>📊 系统概览</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                  <div style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    <h3 style={{ color: '#28a745', margin: '0 0 1rem 0' }}>✅ 服务器状态</h3>
                    <p style={{ color: '#666', margin: 0 }}>正常运行</p>
                  </div>
                  <div style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    <h3 style={{ color: '#17a2b8', margin: '0 0 1rem 0' }}>🔌 API端点</h3>
                    <p style={{ color: '#666', margin: 0 }}>9个端点正常</p>
                  </div>
                  <div style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    <h3 style={{ color: '#ffc107', margin: '0 0 1rem 0' }}>🔐 加密状态</h3>
                    <p style={{ color: '#666', margin: 0 }}>HMAC + AES 正常</p>
                  </div>
                </div>

                <div style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  marginTop: '2rem'
                }}>
                  <h3 style={{ color: '#333', marginBottom: '1rem' }}>🔗 快速链接</h3>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <a
                      href="https://cursor-cdk-server.vercel.app/"
                      target="_blank"
                      style={{
                        padding: '8px 16px',
                        background: '#007bff',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    >
                      🏠 服务器首页
                    </a>
                    <a
                      href="https://cursor-cdk-server.vercel.app/api/get_settings"
                      target="_blank"
                      style={{
                        padding: '8px 16px',
                        background: '#28a745',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    >
                      🔧 测试API
                    </a>
                    <a
                      href="https://github.com/jianxianglin808/cursor-cdk-server"
                      target="_blank"
                      style={{
                        padding: '8px 16px',
                        background: '#6c757d',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    >
                      📱 GitHub仓库
                    </a>
                  </div>
                </div>
              </div>
            )}

            {currentView === 'keys' && (
              <div>
                <h2 style={{ color: '#333', marginBottom: '1.5rem' }}>🔐 密钥管理</h2>
                <div style={{
                  background: 'white',
                  padding: '2rem',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <p style={{ color: '#666', textAlign: 'center', fontSize: '16px' }}>
                    密钥管理功能正在开发中...
                  </p>
                  <p style={{ color: '#666', textAlign: 'center', fontSize: '14px', marginTop: '1rem' }}>
                    当前使用的是基于端到端API报告的标准密钥配置
                  </p>
                </div>
              </div>
            )}

            {currentView === 'content' && (
              <div>
                <h2 style={{ color: '#333', marginBottom: '1.5rem' }}>📝 内容管理</h2>
                <div style={{
                  background: 'white',
                  padding: '2rem',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <p style={{ color: '#666', textAlign: 'center', fontSize: '16px' }}>
                    内容编辑功能正在开发中...
                  </p>
                  <p style={{ color: '#666', textAlign: 'center', fontSize: '14px', marginTop: '1rem' }}>
                    即将支持广告内容、提示信息等的在线编辑
                  </p>
                </div>
              </div>
            )}

            {currentView === 'database' && (
              <div>
                <h2 style={{ color: '#333', marginBottom: '1.5rem' }}>🗄️ 数据库管理</h2>
                <div style={{
                  background: 'white',
                  padding: '2rem',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <p style={{ color: '#666', textAlign: 'center', fontSize: '16px' }}>
                    数据库管理功能正在开发中...
                  </p>
                  <p style={{ color: '#666', textAlign: 'center', fontSize: '14px', marginTop: '1rem' }}>
                    即将支持CDK管理、用户设备、积分记录等数据的管理
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
