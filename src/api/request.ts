import axios from 'axios'
import type { ApiResponse } from '@/types'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    const res = response.data as ApiResponse<unknown>
    if (res.code !== 200) {
      console.error('API Error:', res.message)
      return Promise.reject(new Error(res.message || 'Error'))
    }
    return response
  },
  (error) => {
    console.error('Request Error:', error.message)
    return Promise.reject(error)
  }
)

export default api
