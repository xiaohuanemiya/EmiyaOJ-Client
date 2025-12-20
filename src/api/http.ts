/**
 * HTTP 请求工具
 * 提供基础的 HTTP 请求方法
 */

import type { ApiResponse } from '../types/blog';

/**
 * HTTP 请求配置
 */
export interface RequestConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

/**
 * 默认配置
 */
const defaultConfig: RequestConfig = {
  baseURL: '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * HTTP 客户端类
 */
class HttpClient {
  private config: RequestConfig;

  constructor(config: RequestConfig = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * 发送 GET 请求
   */
  async get<T = any>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const queryString = params ? '?' + new URLSearchParams(this.serializeParams(params)).toString() : '';
    const fullUrl = `${this.config.baseURL}${url}${queryString}`;

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: this.config.headers,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * 发送 POST 请求
   */
  async post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    const fullUrl = `${this.config.baseURL}${url}`;

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: this.config.headers,
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  /**
   * 发送 PUT 请求
   */
  async put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    const fullUrl = `${this.config.baseURL}${url}`;

    const response = await fetch(fullUrl, {
      method: 'PUT',
      headers: this.config.headers,
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  /**
   * 发送 DELETE 请求
   */
  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    const fullUrl = `${this.config.baseURL}${url}`;

    const response = await fetch(fullUrl, {
      method: 'DELETE',
      headers: this.config.headers,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * 处理响应
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        code: response.status,
        message: response.statusText,
        data: null,
      }));
      throw error;
    }

    return response.json();
  }

  /**
   * 序列化参数（处理 undefined 和 null）
   */
  private serializeParams(params: Record<string, any>): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        result[key] = String(value);
      }
    }
    return result;
  }
}

/**
 * 创建并导出默认 HTTP 客户端实例
 */
export const httpClient = new HttpClient();

/**
 * 导出 HttpClient 类以便自定义实例
 */
export default HttpClient;
