// src/types/user.ts

/**
 * 用户信息
 */
export interface User {
  id: number
  username: string
  email?: string
  avatar?: string
  createTime: string
}

/**
 * 登录参数
 */
export interface LoginParams {
  username: string
  password: string
}

/**
 * 登录响应
 */
export interface LoginResponse {
  token: string
  user: User
}
