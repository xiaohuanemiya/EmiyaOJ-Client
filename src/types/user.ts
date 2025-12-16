// src/types/user.ts

/**
 * 用户信息
 */
export interface User {
  id: string
  username: string
  name: string
  email?: string
  avatar?: string
  createTime?: string
}

/**
 * 登录参数 (UserLoginDTO)
 */
export interface LoginParams {
  username: string
  password: string
}

/**
 * 登录响应 (UserLoginVO)
 */
export interface LoginResponse {
  id: string
  username: string
  name: string
  token: string
}
