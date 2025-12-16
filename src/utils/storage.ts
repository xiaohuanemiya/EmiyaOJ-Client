// src/utils/storage.ts

const TOKEN_KEY = 'emiya_oj_token'
const USER_KEY = 'emiya_oj_user'

/**
 * 保存Token
 */
export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token)
}

/**
 * 获取Token
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * 移除Token
 */
export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * 保存用户信息
 */
export const setUser = (user: any): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

/**
 * 获取用户信息
 */
export const getUser = (): any | null => {
  const userStr = localStorage.getItem(USER_KEY)
  return userStr ? JSON.parse(userStr) : null
}

/**
 * 移除用户信息
 */
export const removeUser = (): void => {
  localStorage.removeItem(USER_KEY)
}

/**
 * 清空所有本地存储
 */
export const clearStorage = (): void => {
  localStorage.clear()
}
