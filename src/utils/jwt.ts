import { jwtDecode } from 'jwt-decode'
import type { JwtPayload, UserLoginInfo } from '@/types/api'

/**
 * 解析JWT token
 * @param token JWT token
 * @returns 解析后的用户信息
 */
export function parseJwtToken(token: string): UserLoginInfo | null {
  try {
    const decoded = jwtDecode<JwtPayload>(token)
    const userLogin: UserLoginInfo = JSON.parse(decoded.userLogin)
    return userLogin
  } catch (error) {
    console.error('JWT解析失败:', error)
    return null
  }
}

/**
 * 检查token是否过期
 * @param token JWT token
 * @returns 是否过期
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<JwtPayload>(token)
    const currentTime = Date.now() / 1000
    return decoded.exp < currentTime
  } catch {
    return true
  }
}
