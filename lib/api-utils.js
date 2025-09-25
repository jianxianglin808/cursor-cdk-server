/**
 * API 工具函数 - 统一处理 API 响应
 * 解决 "Unexpected token '<', "<!DOCTYPE"..." 错误
 */

/**
 * 安全地解析 JSON 响应
 * @param {Response} response - Fetch API 响应对象
 * @returns {Promise<Object>} 解析后的 JSON 数据
 * @throws {Error} 如果响应不是有效的 JSON
 */
export async function safeJsonParse(response) {
  // 检查响应状态
  if (!response.ok) {
    throw new Error(`HTTP错误! 状态: ${response.status} ${response.statusText}`);
  }
  
  // 检查内容类型
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    // 尝试获取响应文本以提供更有用的错误信息
    const text = await response.text();
    if (text.trim().startsWith('<!DOCTYPE')) {
      throw new Error('服务器返回了HTML页面而不是JSON数据，可能是路由不存在或发生了重定向');
    }
    throw new Error(`服务器返回的不是JSON格式的数据。Content-Type: ${contentType || '未知'}`);
  }
  
  // 解析 JSON
  try {
    return await response.json();
  } catch (error) {
    throw new Error(`JSON解析失败: ${error.message}`);
  }
}

/**
 * 带认证的 API 请求
 * @param {string} url - 请求 URL
 * @param {Object} options - fetch 选项
 * @returns {Promise<Object>} 解析后的响应数据
 */
export async function authenticatedRequest(url, options = {}) {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('admin_token') : null;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
  
  const requestOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };
  
  const response = await fetch(url, requestOptions);
  return await safeJsonParse(response);
}

/**
 * GET 请求的便捷方法
 * @param {string} url - 请求 URL
 * @returns {Promise<Object>} 解析后的响应数据
 */
export async function apiGet(url) {
  return await authenticatedRequest(url, { method: 'GET' });
}

/**
 * POST 请求的便捷方法
 * @param {string} url - 请求 URL
 * @param {Object} data - 请求数据
 * @returns {Promise<Object>} 解析后的响应数据
 */
export async function apiPost(url, data) {
  return await authenticatedRequest(url, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

/**
 * PUT 请求的便捷方法
 * @param {string} url - 请求 URL
 * @param {Object} data - 请求数据
 * @returns {Promise<Object>} 解析后的响应数据
 */
export async function apiPut(url, data) {
  return await authenticatedRequest(url, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

/**
 * DELETE 请求的便捷方法
 * @param {string} url - 请求 URL
 * @returns {Promise<Object>} 解析后的响应数据
 */
export async function apiDelete(url) {
  return await authenticatedRequest(url, { method: 'DELETE' });
}
