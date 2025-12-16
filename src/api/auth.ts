// src/api/auth.ts
import request from './request'
import type { ApiResponse } from '@/types/api'
import type { User, LoginParams, LoginResponse } from '@/types/user'

/**
 * 用户登录
 */
export const login = (data: LoginParams): Promise<ApiResponse<LoginResponse>> => {
  return request({
    url: '/auth/login',
    method: 'POST',
    data
  })
}

/**
 * 用户登出
 */
export const logout = (): Promise<ApiResponse<void>> => {
  return request({
    url: '/auth/logout',
    method: 'POST'
  })
}

/**
 * 获取当前用户信息
 */
export const getCurrentUser = (): Promise<ApiResponse<User>> => {
  return request({
    url: '/user/current',
    method: 'GET'
  })
}
