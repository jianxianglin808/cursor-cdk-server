import { useState, useEffect } from 'react';

export default function LogsViewer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [filters, setFilters] = useState({ 
    action: 'all', 
    admin: 'all',
    timeRange: '24h'
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0 });

  useEffect(() => {
    loadLogs();
  }, [filters, pagination.page]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });
      
      const response = await fetch(`/api/admin/logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setLogs(data.logs);
        setPagination(prev => ({ ...prev, total: data.total }));
      } else {
        setMessage('加载日志失败: ' + data.message);
      }
    } catch (error) {
      setMessage('加载日志失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = async (timeRange) => {
    if (!confirm(`确定要清除${timeRange === '7d' ? '7天前' : timeRange === '30d' ? '30天前' : '全部'}的日志吗？`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/logs/clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({ timeRange })
      });
      
      const data = await response.json();
      if (data.success) {
        setMessage(`成功清除 ${data.deletedCount} 条日志记录`);
        loadLogs();
      } else {
        setMessage('清除失败: ' + data.message);
      }
    } catch (error) {
      setMessage('清除失败: ' + error.message);
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'LOGIN': return '🔑';
      case 'CDK_GENERATE': return '🎟️';
      case 'CDK_STATUS_UPDATE': return '📝';
      case 'KEYS_UPDATE': return '🔐';
      case 'CONTENT_UPDATE': return '📄';
      case 'DATABASE_INIT': return '🗄️';
      default: return '📋';
    }
  };

  const getActionText = (action) => {
    switch (action) {
      case 'LOGIN': return '管理员登录';
      case 'CDK_GENERATE': return 'CDK生成';
      case 'CDK_STATUS_UPDATE': return 'CDK状态更新';
      case 'KEYS_UPDATE': return '密钥更新';
      case 'CONTENT_UPDATE': return '内容更新';
      case 'DATABASE_INIT': return '数据库初始化';
      default: return action;
    }
  };

  const formatDetails = (details) => {
    try {
      const parsed = JSON.parse(details);
      return (
        <div style={{ fontSize: '12px', color: '#666' }}>
          {Object.entries(parsed).map(([key, value]) => (
            <div key={key} style={{ marginBottom: '2px' }}>
              <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : String(value)}
            </div>
          ))}
        </div>
      );
    } catch {
      return <span style={{ fontSize: '12px', color: '#666' }}>{details}</span>;
    }
  };

  return (
    <div>
      <h2 style={{ color: '#333', marginBottom: '1.5rem' }}>📜 操作日志</h2>
      
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

      {/* 筛选器和控制 */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      }}>
        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          alignItems: 'center', 
          flexWrap: 'wrap',
          marginBottom: '16px'
        }}>
          <div>
            <label style={{ marginRight: '8px', color: '#333' }}>操作类型:</label>
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            >
              <option value="all">全部</option>
              <option value="LOGIN">管理员登录</option>
              <option value="CDK_GENERATE">CDK生成</option>
              <option value="CDK_STATUS_UPDATE">CDK状态更新</option>
              <option value="KEYS_UPDATE">密钥更新</option>
              <option value="CONTENT_UPDATE">内容更新</option>
              <option value="DATABASE_INIT">数据库初始化</option>
            </select>
          </div>
          
          <div>
            <label style={{ marginRight: '8px', color: '#333' }}>时间范围:</label>
            <select
              value={filters.timeRange}
              onChange={(e) => setFilters({ ...filters, timeRange: e.target.value })}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            >
              <option value="1h">最近1小时</option>
              <option value="24h">最近24小时</option>
              <option value="7d">最近7天</option>
              <option value="30d">最近30天</option>
              <option value="all">全部</option>
            </select>
          </div>
          
          <button
            onClick={loadLogs}
            disabled={loading}
            style={{
              padding: '6px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '加载中...' : '🔄 刷新'}
          </button>
        </div>

        {/* 清理控制 */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          flexWrap: 'wrap',
          paddingTop: '16px',
          borderTop: '1px solid #eee'
        }}>
          <span style={{ color: '#666', alignSelf: 'center' }}>日志清理:</span>
          <button
            onClick={() => clearLogs('7d')}
            style={{
              padding: '4px 12px',
              backgroundColor: '#ffc107',
              color: '#212529',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            清除7天前
          </button>
          <button
            onClick={() => clearLogs('30d')}
            style={{
              padding: '4px 12px',
              backgroundColor: '#fd7e14',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            清除30天前
          </button>
          <button
            onClick={() => clearLogs('all')}
            style={{
              padding: '4px 12px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            清除全部
          </button>
        </div>
      </div>

      {/* 日志列表 */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #eee',
          backgroundColor: '#f8f9fa'
        }}>
          <h3 style={{ color: '#333', margin: 0 }}>📋 操作日志 (共 {pagination.total} 条)</h3>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            加载中...
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            暂无日志数据
          </div>
        ) : (
          <div>
            {logs.map((log, index) => (
              <div 
                key={log.id || index}
                style={{
                  padding: '16px 24px',
                  borderBottom: index < logs.length - 1 ? '1px solid #f1f3f4' : 'none',
                  display: 'grid',
                  gridTemplateColumns: '60px 150px 120px 200px 1fr 120px',
                  gap: '16px',
                  alignItems: 'start'
                }}
              >
                {/* 操作图标 */}
                <div style={{ fontSize: '24px', textAlign: 'center' }}>
                  {getActionIcon(log.action)}
                </div>

                {/* 操作类型 */}
                <div>
                  <div style={{ fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>
                    {getActionText(log.action)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {log.admin_username}
                  </div>
                </div>

                {/* 时间 */}
                <div style={{ fontSize: '14px', color: '#666' }}>
                  {new Date(log.created_at).toLocaleString('zh-CN', {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </div>

                {/* IP地址 */}
                <div style={{ fontSize: '12px', color: '#666', fontFamily: 'monospace' }}>
                  {log.ip_address || 'unknown'}
                </div>

                {/* 详细信息 */}
                <div>
                  {log.details && formatDetails(log.details)}
                </div>

                {/* User Agent */}
                <div style={{ fontSize: '11px', color: '#999', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {log.user_agent ? (
                    log.user_agent.includes('Mozilla') ? 
                      (log.user_agent.includes('Chrome') ? '🌐 Chrome' :
                       log.user_agent.includes('Firefox') ? '🦊 Firefox' :
                       log.user_agent.includes('Safari') ? '🧭 Safari' : '🌐 Browser') :
                      '🤖 API'
                  ) : 'unknown'}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 分页 */}
        {pagination.total > pagination.limit && (
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ color: '#666', fontSize: '14px' }}>
              第 {pagination.page} 页，共 {Math.ceil(pagination.total / pagination.limit)} 页
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                style={{
                  padding: '6px 12px',
                  backgroundColor: pagination.page === 1 ? '#e9ecef' : '#007bff',
                  color: pagination.page === 1 ? '#6c757d' : 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: pagination.page === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                上一页
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: pagination.page >= Math.ceil(pagination.total / pagination.limit) ? '#e9ecef' : '#007bff',
                  color: pagination.page >= Math.ceil(pagination.total / pagination.limit) ? '#6c757d' : 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: pagination.page >= Math.ceil(pagination.total / pagination.limit) ? 'not-allowed' : 'pointer'
                }}
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
