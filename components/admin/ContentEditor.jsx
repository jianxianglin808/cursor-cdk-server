import React, { useState, useEffect } from 'react';
import './ContentEditor.css';

export default function ContentEditor() {
  const [content, setContent] = useState({
    common_problem: '',
    buy_url: '',
    cdk_expiration_prompt: '',
    maintenance_notice: '',
    update_announcement: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  // 加载当前内容
  useEffect(() => {
    fetchCurrentContent();
  }, []);

  const fetchCurrentContent = async () => {
    try {
      const response = await fetch('/api/admin/get-content', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setContent(data.content);
      }
    } catch (error) {
      setMessage('获取内容失败: ' + error.message);
    }
  };

  const handleContentChange = (key, value) => {
    setContent(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const insertLink = (key, linkText, url) => {
    const currentContent = content[key];
    const linkHtml = `<a href="${url}" target="_blank" style="color: #3182ce; text-decoration: underline;">${linkText}</a>`;
    const newContent = currentContent + linkHtml;
    handleContentChange(key, newContent);
  };

  const insertEmoji = (key, emoji) => {
    const currentContent = content[key];
    const newContent = currentContent + emoji;
    handleContentChange(key, newContent);
  };

  const saveContent = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/update-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({ content })
      });

      const data = await response.json();
      if (data.success) {
        setMessage('内容更新成功！');
      } else {
        setMessage('内容更新失败: ' + data.message);
      }
    } catch (error) {
      setMessage('内容更新失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetToDefault = () => {
    const defaultContent = {
      common_problem: "💡重要提示: 为优化使用体验，后端已完成调整，现已支持所有AI模型！<br><br>🎯 <strong>新功能特色</strong>:<br>✅ 支持Claude-4-Max模型<br>✅ 免魔法模式（Pro版专享）<br>✅ 智能账号池管理<br>✅ 断线自动重连<br><br>🔗 <a href=\"https://pay.ldxp.cn/shop/HS67LQ6L\" target=\"_blank\" style=\"color: #ff6b6b; font-weight: bold;\">立即购买激活码</a>",
      buy_url: "https://pay.ldxp.cn/shop/HS67LQ6L",
      cdk_expiration_prompt: "激活码已过期，请购买激活码",
      maintenance_notice: "",
      update_announcement: ""
    };
    setContent(defaultContent);
    setMessage('已重置为默认内容');
  };

  const contentFields = [
    {
      key: 'common_problem',
      title: '💡 常见问题提示',
      description: '显示在插件界面的主要提示内容',
      placeholder: '输入提示内容，支持HTML标签...',
      rows: 8
    },
    {
      key: 'buy_url',
      title: '🛒 购买链接',
      description: '用户点击购买按钮跳转的URL',
      placeholder: 'https://pay.ldxp.cn/shop/HS67LQ6L',
      rows: 2
    },
    {
      key: 'cdk_expiration_prompt',
      title: '⏰ CDK过期提示',
      description: '激活码过期时显示的提示信息',
      placeholder: '激活码已过期，请购买激活码',
      rows: 2
    },
    {
      key: 'maintenance_notice',
      title: '🔧 维护公告',
      description: '系统维护时显示的公告内容',
      placeholder: '系统维护公告...',
      rows: 4
    },
    {
      key: 'update_announcement',
      title: '📢 更新公告',
      description: '版本更新时显示的公告内容',
      placeholder: '版本更新公告...',
      rows: 4
    }
  ];

  const quickEmojis = ['💡', '🎯', '✅', '🔗', '⚠️', '🎉', '🚀', '💰', '🔥', '⭐', '🎁', '📱'];
  const quickColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];

  return (
    <div className="content-editor">
      <div className="content-header">
        <div>
          <h2>📝 广告内容编辑器</h2>
          <p>管理插件界面显示的各种提示和广告内容</p>
        </div>
        <div className="header-actions">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`preview-btn ${previewMode ? 'active' : ''}`}
          >
            {previewMode ? '📝 编辑模式' : '👁️ 预览模式'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes('成功') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="content-grid">
        {contentFields.map(field => (
          <div key={field.key} className="content-item">
            <div className="content-item-header">
              <h3>{field.title}</h3>
              <p>{field.description}</p>
            </div>

            {!previewMode ? (
              <div className="editor-container">
                <div className="editor-toolbar">
                  <div className="emoji-group">
                    <span className="toolbar-label">快速表情:</span>
                    {quickEmojis.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => insertEmoji(field.key, emoji)}
                        className="emoji-btn"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  
                  <div className="link-group">
                    <button
                      onClick={() => {
                        const linkText = prompt('链接文字:');
                        const url = prompt('链接地址:');
                        if (linkText && url) {
                          insertLink(field.key, linkText, url);
                        }
                      }}
                      className="link-btn"
                    >
                      🔗 插入链接
                    </button>
                  </div>
                </div>

                <textarea
                  value={content[field.key]}
                  onChange={(e) => handleContentChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  rows={field.rows}
                  className="content-textarea"
                />

                <div className="char-count">
                  {content[field.key].length} 字符
                </div>
              </div>
            ) : (
              <div className="preview-container">
                <div 
                  className="content-preview"
                  dangerouslySetInnerHTML={{ __html: content[field.key] }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="content-actions">
        <button
          onClick={resetToDefault}
          className="reset-btn"
          disabled={loading}
        >
          🔄 重置为默认内容
        </button>
        
        <button
          onClick={saveContent}
          className="save-btn"
          disabled={loading}
        >
          {loading ? '保存中...' : '💾 保存内容'}
        </button>
      </div>

      <div className="content-tips">
        <h3>💡 编辑提示</h3>
        <div className="tips-grid">
          <div className="tip-item">
            <strong>HTML支持:</strong>
            <code>&lt;br&gt;</code> 换行，
            <code>&lt;strong&gt;</code> 加粗，
            <code>&lt;a href=""&gt;</code> 链接
          </div>
          <div className="tip-item">
            <strong>样式建议:</strong>
            使用内联样式 <code>style="color: #ff6b6b; font-weight: bold;"</code>
          </div>
          <div className="tip-item">
            <strong>链接跳转:</strong>
            添加 <code>target="_blank"</code> 在新窗口打开
          </div>
          <div className="tip-item">
            <strong>表情符号:</strong>
            适量使用emoji提升视觉效果，建议每行不超过3个
          </div>
        </div>
      </div>
    </div>
  );
}
