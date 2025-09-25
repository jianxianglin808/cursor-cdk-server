import React, { useState, useEffect } from 'react';
import { apiGet, apiPost } from '../../lib/api-utils';

export default function KeysManager() {
  const [keys, setKeys] = useState({
    HMAC_KEY: '',
    WEB_AES_KEY: '',
    NODE_AES_KEY: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showKeys, setShowKeys] = useState({
    HMAC_KEY: false,
    WEB_AES_KEY: false,
    NODE_AES_KEY: false
  });

  // 加载当前密钥
  useEffect(() => {
    fetchCurrentKeys();
  }, []);

  const fetchCurrentKeys = async () => {
    try {
      const data = await apiGet('/api/admin/get-keys');
      if (data.success) {
        setKeys(data.keys);
      }
    } catch (error) {
      setMessage('获取密钥失败: ' + error.message);
    }
  };

  const handleKeyChange = (keyType, value) => {
    setKeys(prev => ({
      ...prev,
      [keyType]: value
    }));
  };

  const toggleKeyVisibility = (keyType) => {
    setShowKeys(prev => ({
      ...prev,
      [keyType]: !prev[keyType]
    }));
  };

  const validateKey = (keyType, key) => {
    // 验证密钥格式（64字符十六进制）
    const hexRegex = /^[a-fA-F0-9]{64}$/;
    return hexRegex.test(key);
  };

  const generateRandomKey = (keyType) => {
    // 生成32字节随机密钥
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const newKey = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    handleKeyChange(keyType, newKey);
  };

  const saveKeys = async () => {
    setLoading(true);
    setMessage('');

    // 验证所有密钥格式
    for (const [keyType, key] of Object.entries(keys)) {
      if (!validateKey(keyType, key)) {
        setMessage(`${keyType} 格式错误：必须是64字符十六进制字符串`);
        setLoading(false);
        return;
      }
    }

    try {
      const data = await apiPost('/api/admin/update-keys', { keys });
      if (data.success) {
        setMessage('密钥更新成功！服务器将在30秒内重启生效。');
      } else {
        setMessage('密钥更新失败: ' + data.message);
      }
    } catch (error) {
      setMessage('密钥更新失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetToDefault = () => {
    const defaultKeys = {
      HMAC_KEY: '9c5f66da591ea9f793959ec358abe1c14989d13642dcd92272e9f02a9811993e',
      WEB_AES_KEY: 'bcfd1f8dd31c6917b714b38dbf5c87e533831f1c151320a3b172ad082041b072',
      NODE_AES_KEY: 'b065e8b242c7b887a9e06618e37f7f3b4930f5804ec115d4410017214e04aeff'
    };
    setKeys(defaultKeys);
    setMessage('已重置为默认密钥');
  };

  return (
    <div className="keys-manager">
      <div className="keys-header">
        <h2>🔐 三密钥体系管理</h2>
        <p>管理HMAC签名、Web AES解密和Node.js AES加密密钥</p>
      </div>

      {message && (
        <div className={`message ${message.includes('成功') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="keys-grid">
        {Object.entries(keys).map(([keyType, keyValue]) => (
          <div key={keyType} className="key-item">
            <div className="key-header">
              <label htmlFor={keyType}>
                <span className="key-icon">
                  {keyType === 'HMAC_KEY' && '🔏'}
                  {keyType === 'WEB_AES_KEY' && '🔓'}
                  {keyType === 'NODE_AES_KEY' && '🔐'}
                </span>
                {keyType}
              </label>
              <div className="key-actions">
                <button
                  type="button"
                  onClick={() => toggleKeyVisibility(keyType)}
                  className="toggle-btn"
                >
                  {showKeys[keyType] ? '👁️' : '🙈'}
                </button>
                <button
                  type="button"
                  onClick={() => generateRandomKey(keyType)}
                  className="generate-btn"
                  title="生成随机密钥"
                >
                  🎲
                </button>
              </div>
            </div>
            
            <div className="key-input-container">
              <input
                type={showKeys[keyType] ? 'text' : 'password'}
                id={keyType}
                value={keyValue}
                onChange={(e) => handleKeyChange(keyType, e.target.value)}
                className={`key-input ${!validateKey(keyType, keyValue) && keyValue ? 'invalid' : ''}`}
                placeholder="64字符十六进制密钥"
                maxLength={64}
              />
              <div className="key-info">
                <span className={`length-indicator ${keyValue.length === 64 ? 'valid' : 'invalid'}`}>
                  {keyValue.length}/64
                </span>
                {!validateKey(keyType, keyValue) && keyValue && (
                  <span className="validation-error">格式错误</span>
                )}
              </div>
            </div>

            <div className="key-description">
              {keyType === 'HMAC_KEY' && '用于请求签名验证和JWT令牌签名'}
              {keyType === 'WEB_AES_KEY' && '用于响应数据AES-CBC-256解密'}
              {keyType === 'NODE_AES_KEY' && '用于服务器端数据AES-CTR-256加密'}
            </div>
          </div>
        ))}
      </div>

      <div className="keys-actions">
        <button
          onClick={resetToDefault}
          className="reset-btn"
          disabled={loading}
        >
          🔄 重置为默认密钥
        </button>
        
        <button
          onClick={saveKeys}
          className="save-btn"
          disabled={loading || Object.values(keys).some((key, index) => !validateKey(Object.keys(keys)[index], key))}
        >
          {loading ? '保存中...' : '💾 保存密钥'}
        </button>
      </div>

      <div className="keys-warning">
        <h3>⚠️ 重要提醒</h3>
        <ul>
          <li>密钥更新后服务器将自动重启，所有用户需要重新登录</li>
          <li>请确保备份旧密钥，以防需要回滚</li>
          <li>密钥必须是64字符的十六进制字符串（32字节）</li>
          <li>建议定期更新密钥以提高安全性</li>
        </ul>
      </div>
    </div>
  );
}
