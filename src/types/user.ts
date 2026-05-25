// src/types/user.ts

/**
 * 用户信息
 */
export interface User {
  id: string
  username: string
  nickname: string
  email?: string
  phone?: string
  avatar?: string
  status?: number
  statusDesc?: string
  createTime?: string
  updateTime?: string
}

/**
 * 注册参数
 */
export interface RegisterParams {
  username: string
  password: string
  nickname: string
  email: string
  phone?: string
}

/**
 * 登录参数
 */
export interface LoginParams {
  username: string
  password: string
}

/**
 * 登录响应（用户登录成功返回 VO）
 */
export interface LoginResponse {
  id: string
  username: string
  nickname: string
  token: string
}

/**
 * JWT Token 解析后的载荷
 */
export interface TokenPayload {
  permissions: string[]
  userId?: string
  id?: string
  sub?: string
  username?: string
  iat: number
  exp: number
}

/**
 * Token 解析响应
 */
export interface UserAuthDTO {
  userId: string
  username: string
  permissions: string[]
}
