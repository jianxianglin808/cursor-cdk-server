import { useState, useEffect } from 'react';

export default function CDKManager() {
  const [cdks, setCdks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [filters, setFilters] = useState({ status: 'all', type: 'all' });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  useEffect(() => {
    loadCDKs();
  }, [filters, pagination.page]);

  const loadCDKs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });
      
      const response = await fetch(`/api/admin/cdks?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setCdks(data.cdks);
        setPagination(prev => ({ ...prev, total: data.total }));
      } else {
        setMessage('加载CDK失败: ' + data.message);
      }
    } catch (error) {
      setMessage('加载CDK失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateCDKStatus = async (cdkCode, newStatus) => {
    try {
      const response = await fetch('/api/admin/cdks/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({ cdk_code: cdkCode, status: newStatus })
      });
      
      const data = await response.json();
      if (data.success) {
        setMessage('CDK状态更新成功');
        loadCDKs();
      } else {
        setMessage('更新失败: ' + data.message);
      }
    } catch (error) {
      setMessage('更新失败: ' + error.message);
    }
  };

  const generateCDK = async (type, count = 1) => {
    try {
      const response = await fetch('/api/admin/cdks/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({ type, count })
      });
      
      const data = await response.json();
      if (data.success) {
        setMessage(`成功生成 ${count} 个 ${type} 类型的CDK`);
        loadCDKs();
      } else {
        setMessage('生成失败: ' + data.message);
      }
    } catch (error) {
      setMessage('生成失败: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'unused': return '#28a745';
      case 'active': return '#007bff';
      case 'expired': return '#dc3545';
      case 'disabled': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'unused': return '未使用';
      case 'active': return '已激活';
      case 'expired': return '已过期';
      case 'disabled': return '已禁用';
      default: return '未知';
    }
  };

  const cdkTypes = [
    'DAYPRO', 'WEEKPRO', 'MONTHPRO', 'QUARTERPRO', 'YEARPRO',
    'DAY', 'WEEK', 'MONTH', 'QUARTER'
  ];

  return (
    <div>
      <h2 style={{ color: '#333', marginBottom: '1.5rem' }}>🎟️ CDK激活码管理</h2>
      
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

      {/* 生成CDK工具 */}
      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      }}>
        <h3 style={{ color: '#333', marginBottom: '16px' }}>🚀 生成新CDK</h3>
        
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {cdkTypes.map(type => (
            <button
              key={type}
              onClick={() => generateCDK(type, 1)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              生成 {type}
            </button>
          ))}
        </div>
      </div>

      {/* 筛选器 */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label style={{ marginRight: '8px', color: '#333' }}>状态:</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            >
              <option value="all">全部</option>
              <option value="unused">未使用</option>
              <option value="active">已激活</option>
              <option value="expired">已过期</option>
              <option value="disabled">已禁用</option>
            </select>
          </div>
          
          <div>
            <label style={{ marginRight: '8px', color: '#333' }}>类型:</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            >
              <option value="all">全部</option>
              {cdkTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <button
            onClick={loadCDKs}
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
      </div>

      {/* CDK列表 */}
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
          <h3 style={{ color: '#333', margin: 0 }}>📋 CDK列表 (共 {pagination.total} 个)</h3>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            加载中...
          </div>
        ) : cdks.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            暂无CDK数据
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>CDK代码</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>类型</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>状态</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>创建时间</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>激活时间</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>过期时间</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {cdks.map((cdk) => (
                  <tr key={cdk.cdk_code}>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontFamily: 'monospace', fontSize: '14px' }}>
                      {cdk.cdk_code}
                    </td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>
                      <span style={{
                        padding: '4px 8px',
                        backgroundColor: '#e9ecef',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {cdk.cdk_type}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>
                      <span style={{
                        padding: '4px 8px',
                        backgroundColor: getStatusColor(cdk.status) + '20',
                        color: getStatusColor(cdk.status),
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {getStatusText(cdk.status)}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontSize: '14px' }}>
                      {cdk.created_at ? new Date(cdk.created_at).toLocaleString() : '-'}
                    </td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontSize: '14px' }}>
                      {cdk.activated_at ? new Date(cdk.activated_at).toLocaleString() : '-'}
                    </td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', fontSize: '14px' }}>
                      {cdk.expires_at ? new Date(cdk.expires_at).toLocaleString() : '-'}
                    </td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6', textAlign: 'center' }}>
                      {cdk.status === 'unused' && (
                        <button
                          onClick={() => updateCDKStatus(cdk.cdk_code, 'disabled')}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            marginRight: '4px'
                          }}
                        >
                          禁用
                        </button>
                      )}
                      {cdk.status === 'disabled' && (
                        <button
                          onClick={() => updateCDKStatus(cdk.cdk_code, 'unused')}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          启用
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
