import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authAPI } from '@/api/auth'
import router from '@/router'
import type { UserLoginDTO, UserLoginVO } from '@/types/api'
import { parseJwtToken, isTokenExpired } from '@/utils/jwt'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<UserLoginVO | null>(
    JSON.parse(localStorage.getItem('userInfo') || 'null')
  )
  const permissions = ref<string[]>(
    JSON.parse(localStorage.getItem('permissions') || '[]')
  )

  /** 登录 */
  const login = async (loginForm: UserLoginDTO) => {
    try {
      const loginData = await authAPI.login(loginForm)
      
      token.value = loginData.token
      userInfo.value = loginData
      
      // 保存到 localStorage
      localStorage.setItem('token', loginData.token)
      localStorage.setItem('userInfo', JSON.stringify(loginData))
      
      // 从 JWT 解析权限信息
      const jwtData = parseJwtToken(loginData.token)
      if (jwtData) {
        permissions.value = jwtData.permissions || []
        localStorage.setItem('permissions', JSON.stringify(permissions.value))
      }
      
      return loginData
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  }

  /** 登出 */
  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('登出失败:', error)
    } finally {
      // 无论接口是否成功，都清除本地数据
      clearUserInfo()
      router.push('/login')
    }
  }

  /** 清除用户信息 */
  const clearUserInfo = () => {
    token.value = ''
    userInfo.value = null
    permissions.value = []
    
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('permissions')
  }

  /** 检查是否已登录 */
  const isLoggedIn = (): boolean => {
    if (!token.value) return false
    // 检查token是否过期
    if (isTokenExpired(token.value)) {
      return false
    }
    return true
  }

  /** 清除过期的用户信息 */
  const clearExpiredUserInfo = () => {
    if (token.value && isTokenExpired(token.value)) {
      clearUserInfo()
    }
  }

  /** 检查是否有某个权限 */
  const hasPermission = (permission: string): boolean => {
    return permissions.value.includes(permission)
  }

  /** 恢复用户信息（页面刷新时调用） */
  const restoreUserInfo = () => {
    const savedToken = localStorage.getItem('token')
    const savedUserInfo = localStorage.getItem('userInfo')
    const savedPermissions = localStorage.getItem('permissions')

    if (savedToken) {
      // 检查token是否过期
      if (isTokenExpired(savedToken)) {
        console.warn('Token已过期，清除用户信息')
        clearUserInfo()
        return
      }
      
      token.value = savedToken
      
      // 如果没有缓存的权限信息，尝试从JWT解析
      if (!savedPermissions) {
        const jwtData = parseJwtToken(savedToken)
        if (jwtData) {
          permissions.value = jwtData.permissions || []
          localStorage.setItem('permissions', JSON.stringify(permissions.value))
        }
      }
    }
    
    if (savedUserInfo) userInfo.value = JSON.parse(savedUserInfo)
    if (savedPermissions) permissions.value = JSON.parse(savedPermissions)
  }

  return {
    token,
    userInfo,
    permissions,
    login,
    logout,
    clearUserInfo,
    isLoggedIn,
    hasPermission,
    restoreUserInfo,
    clearExpiredUserInfo
  }
})
