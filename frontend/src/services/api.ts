/**
 * API 基础配置和工具函数
 */

// API 基础 URL
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '' : 'http://localhost:8085'));

// 请求配置
interface RequestConfig extends RequestInit {
  params?: Record<string, any>;
}

/**
 * 通用请求函数
 */
export async function request<T = any>(
  url: string,
  config: RequestConfig = {}
): Promise<T> {
  const { params, ...fetchConfig } = config;

  // 构建完整 URL
  let fullUrl = `${API_BASE_URL}${url}`;

  // 添加查询参数
  if (params) {
    const queryString = new URLSearchParams(
      Object.entries(params).filter(([_, value]) => value !== undefined && value !== null)
    ).toString();
    if (queryString) {
      fullUrl += `?${queryString}`;
    }
  }

  // 获取 token
  const token = localStorage.getItem('token');

  // 默认请求头
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchConfig.headers as Record<string, string>),
  };

  // 添加认证头
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(fullUrl, {
      ...fetchConfig,
      headers,
    });

    const data = await response.json();

    // 检查业务状态码
    if (data.code !== 200) {
      // 如果是未授权错误，清除 token 并跳转到登录页
      if (data.code === 401) {
        localStorage.clear();
        window.location.href = '/login';
      }
      throw new Error(data.message || '请求失败');
    }

    return data.data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

/**
 * GET 请求
 */
export function get<T = any>(url: string, params?: Record<string, any>): Promise<T> {
  return request<T>(url, { method: 'GET', params });
}

/**
 * POST 请求
 */
export function post<T = any>(url: string, data?: any): Promise<T> {
  return request<T>(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * PUT 请求
 */
export function put<T = any>(url: string, data?: any): Promise<T> {
  return request<T>(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * DELETE 请求
 */
export function del<T = any>(url: string, params?: Record<string, any>): Promise<T> {
  return request<T>(url, { method: 'DELETE', params });
}

/**
 * 文件上传
 */
export async function upload<T = any>(url: string, file: File): Promise<T> {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('file', file);

  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await response.json();

  if (data.code !== 200) {
    throw new Error(data.message || '上传失败');
  }

  return data.data;
}

