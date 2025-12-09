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
 * @param bufferSeconds 缓冲时间（秒），默认30秒，用于防止时钟偏差和网络延迟
 * @returns 是否过期
 */
export function isTokenExpired(token: string, bufferSeconds = 30): boolean {
  try {
    const decoded = jwtDecode<JwtPayload>(token)
    const currentTime = Date.now() / 1000
    return decoded.exp < currentTime + bufferSeconds
  } catch {
    return true
  }
}
