import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig, type AxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import type { ResponseResult } from '@/types/api'
import { isTokenExpired } from './jwt'

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token) {
      // 检查token是否过期
      if (isTokenExpired(token)) {
        // 清除本地存储
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        localStorage.removeItem('permissions')
        
        ElMessage.error('登录已过期，请重新登录')
        router.push('/login')
        return Promise.reject(new Error('Token已过期'))
      }
      
      // 添加 Token 到请求头
      // 使用 setHeader 方法或直接设置到 headers 对象
      if (config.headers) {
        config.headers.set('Authorization', token.trim())
      }
    }
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<ResponseResult>) => {
    const res = response.data
    
    // 如果响应码不是 200，则判定为错误
    if (res.code !== 200) {
      ElMessage.error(res.msg || '请求失败')
      
      // 401: 未授权
      if (res.code === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        localStorage.removeItem('permissions')
        router.push('/login')
      }
      
      return Promise.reject(new Error(res.msg || 'Error'))
    }
    
    return response
  },
  (error) => {
    console.error('响应错误:', error)
    
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          ElMessage.error('未授权，请先登录')
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          localStorage.removeItem('permissions')
          router.push('/login')
          break
        case 409:
          ElMessage.warning(data.msg || '请求冲突')
          break
        case 500:
          ElMessage.error(data.msg || '服务器错误')
          break
        default:
          ElMessage.error(data.msg || '未知错误')
      }
    } else if (error.request) {
      ElMessage.error('网络错误，请检查网络连接')
    } else {
      ElMessage.error('请求配置错误')
    }
    
    return Promise.reject(error)
  }
)

// 封装请求方法
async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await service.request<ResponseResult<T>>(config)
  return response.data.data
}

export default request
