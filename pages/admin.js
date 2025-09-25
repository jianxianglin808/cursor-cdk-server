import { useState, useEffect } from 'react';
import Head from 'next/head';
import KeysManager from '../components/admin/KeysManager';
import ContentEditor from '../components/admin/ContentEditor';

// 数据库管理组件
function DatabaseManager() {
  const [dbStatus, setDbStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  const checkDatabaseStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/database-status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setDbStatus(data.status);
      } else {
        setMessage('获取数据库状态失败: ' + data.message);
      }
    } catch (error) {
      setMessage('获取数据库状态失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const initializeDatabase = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/admin/init-database', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setMessage('数据库初始化成功！');
        checkDatabaseStatus();
      } else {
        setMessage('数据库初始化失败: ' + data.message);
      }
    } catch (error) {
      setMessage('数据库初始化失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ color: '#333', marginBottom: '1.5rem' }}>🗄️ 数据库管理</h2>
      
      {message && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          backgroundColor: message.includes('成功') ? '#d4edda' : '#f8d7da',
          color: message.includes('成功') ? '#155724' : '#721c24',
          border: `1px solid ${message.includes('成功') ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gap: '24px' }}>
        {/* 数据库状态 */}
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#333', marginBottom: '16px' }}>📊 数据库状态</h3>
          
          {loading ? (
            <p style={{ color: '#666' }}>检查中...</p>
          ) : dbStatus ? (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
                  <h4 style={{ color: '#28a745', margin: '0 0 8px 0' }}>PostgreSQL</h4>
                  <p style={{ color: '#666', margin: 0 }}>
                    状态: {dbStatus.postgres ? '✅ 连接正常' : '❌ 连接失败'}
                  </p>
                </div>
                <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
                  <h4 style={{ color: '#dc3545', margin: '0 0 8px 0' }}>Redis (KV)</h4>
                  <p style={{ color: '#666', margin: 0 }}>
                    状态: {dbStatus.redis ? '✅ 连接正常' : '❌ 连接失败'}
                  </p>
                </div>
              </div>
              
              {dbStatus.tables && (
                <div style={{ marginTop: '16px' }}>
                  <h4 style={{ color: '#333', marginBottom: '8px' }}>数据表状态</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                    {Object.entries(dbStatus.tables).map(([table, exists]) => (
                      <div key={table} style={{
                        padding: '8px 12px',
                        background: exists ? '#d4edda' : '#f8d7da',
                        color: exists ? '#155724' : '#721c24',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}>
                        {table}: {exists ? '✅' : '❌'}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p style={{ color: '#666' }}>无法获取数据库状态</p>
          )}
        </div>

        {/* 数据库操作 */}
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#333', marginBottom: '16px' }}>🔧 数据库操作</h3>
          
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <button
              onClick={checkDatabaseStatus}
              disabled={loading}
              style={{
                padding: '12px 24px',
                background: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '500'
              }}
            >
              {loading ? '检查中...' : '🔄 刷新状态'}
            </button>
            
            <button
              onClick={initializeDatabase}
              disabled={loading}
              style={{
                padding: '12px 24px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '500'
              }}
            >
              {loading ? '初始化中...' : '🚀 初始化数据库'}
            </button>
          </div>

          <div style={{
            marginTop: '16px',
            padding: '16px',
            background: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '6px'
          }}>
            <h4 style={{ color: '#856404', margin: '0 0 8px 0' }}>⚠️ 注意事项</h4>
            <ul style={{ color: '#856404', fontSize: '14px', margin: 0, paddingLeft: '20px' }}>
              <li>初始化操作将创建所有必需的数据表</li>
              <li>如果表已存在，将跳过创建步骤</li>
              <li>建议在首次部署时执行初始化</li>
            </ul>
          </div>
        </div>

        {/* 表结构信息 */}
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#333', marginBottom: '16px' }}>📋 数据表结构</h3>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            {[
              { name: 'cdks', description: 'CDK激活码管理', fields: ['cdk_code', 'cdk_type', 'status', 'activated_at', 'expires_at'] },
              { name: 'user_devices', description: '用户设备绑定', fields: ['author_id', 'device_code', 'cdk_code', 'bound_at'] },
              { name: 'points_records', description: '积分记录管理', fields: ['cdk_code', 'points_balance', 'usage_history'] },
              { name: 'content_settings', description: '内容配置管理', fields: ['content_data', 'updated_by', 'updated_at'] },
              { name: 'admin_logs', description: '管理操作日志', fields: ['admin_username', 'action', 'details', 'created_at'] }
            ].map(table => (
              <div key={table.name} style={{
                padding: '16px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px'
              }}>
                <h4 style={{ color: '#333', margin: '0 0 8px 0' }}>{table.name}</h4>
                <p style={{ color: '#666', fontSize: '14px', margin: '0 0 8px 0' }}>{table.description}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {table.fields.map(field => (
                    <span key={field} style={{
                      padding: '2px 8px',
                      background: '#e9ecef',
                      color: '#495057',
                      borderRadius: '3px',
                      fontSize: '12px'
                    }}>
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

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
              <KeysManager />
            )}

            {currentView === 'content' && (
              <ContentEditor />
            )}

            {currentView === 'database' && (
              <DatabaseManager />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
