// src/api/request.ts
import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { ElMessage } from 'element-plus'
import { getToken, removeToken } from '@/utils/storage'
import type { ApiResponse } from '@/types/api'
import JSONBig from 'json-bigint'

// 创建 JSONBig 实例：将超出安全整数范围的数值转为字符串
const JSONBigString = JSONBig({ storeAsString: true })

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  },
  // 使用 json-bigint 替代默认的 JSON.parse，防止 Long 类型 ID 精度丢失
  transformResponse: [(data: string) => {
    try {
      return JSONBigString.parse(data)
    } catch {
      return data
    }
  }]
})

// 扩展 InternalAxiosRequestConfig，支持 skipAuth 标记
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    skipAuth?: boolean
  }
}

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 添加token到请求头（标记了 skipAuth 的请求除外，如注册接口）
    if (!config.skipAuth) {
      const token = getToken()
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error: AxiosError) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data

    // 如果code不是200，视为错误
    if (res.code !== 200) {
      ElMessage.error(res.message || '请求失败')

      // 401: 未授权，清除 token 并跳转到登录页
      if (res.code === 401) {
        removeToken()
        window.location.href = '/login'
      }

      return Promise.reject(new Error(res.message || '请求失败'))
    }

    return res as any
  },
  (error: AxiosError) => {
    console.error('Response error:', error)
    console.error('Request URL:', error.config?.url)
    console.error('Request method:', error.config?.method)

    let message = '网络错误'
    if (error.response) {
      const errorMessage = (error.response.data as any)?.message || error.message
      switch (error.response.status) {
        case 400:
          message = '请求参数错误'
          break
        case 401:
          message = '未授权，请重新登录'
          removeToken()
          window.location.href = '/login'
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = errorMessage || '请求资源不存在'
          break
        case 500:
          message = '服务器错误'
          break
        case 503:
          message = '服务不可用'
          break
        default:
          message = errorMessage || `连接错误 ${error.response.status}`
      }
    } else if (error.code === 'ECONNABORTED') {
      message = '请求超时'
    } else if (error.message) {
      message = error.message
    }

    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default service
