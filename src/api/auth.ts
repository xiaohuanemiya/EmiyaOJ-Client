// src/api/auth.ts
import request from './request'
import type { ApiResponse } from '@/types/api'
import type { LoginParams, LoginResponse, RegisterParams } from '@/types/user'

/**
 * 用户注册
 * POST /auth/register
 */
export const register = (data: RegisterParams): Promise<ApiResponse<null>> => {
  return request({
    url: '/auth/register',
    method: 'POST',
    data
  })
}

/**
 * 用户登录
 * POST /auth/login
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
 * POST /auth/logout
 */
export const logout = (): Promise<ApiResponse<string>> => {
  return request({
    url: '/auth/logout',
    method: 'POST'
  })
}
