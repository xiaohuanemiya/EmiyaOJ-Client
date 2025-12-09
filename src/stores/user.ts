import { ref } from 'vue'
import { defineStore } from 'pinia'
import { authAPI } from '@/api/auth'
import router from '@/router'
import type { UserLoginDTO, UserLoginVO } from '@/types/api'
import { parseJwtToken, isTokenExpired } from '@/utils/jwt'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<UserLoginVO | null>(
    JSON.parse(localStorage.getItem('userInfo') || 'null')
  )
  const permissions = ref<string[]>(JSON.parse(localStorage.getItem('permissions') || '[]'))

  /** 登录 */
  const login = async (loginForm: UserLoginDTO) => {
    try {
      const res = await authAPI.login(loginForm)
      const loginData = res.data
      const { token: newToken } = loginData

      token.value = newToken
      userInfo.value = loginData

      // 保存到 localStorage
      localStorage.setItem('token', newToken)
      localStorage.setItem('userInfo', JSON.stringify(loginData))

      // 从 JWT 解析权限信息
      const jwtData = parseJwtToken(newToken)
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
  const isLoggedIn = () => {
    if (!token.value) return false
    // 检查token是否过期
    if (isTokenExpired(token.value)) {
      clearUserInfo()
      return false
    }
    return true
  }

  /** 检查是否有权限 */
  const hasPermission = (permission: string): boolean => {
    return permissions.value.includes(permission)
  }

  /** 恢复用户信息（从localStorage） */
  const restoreUserInfo = () => {
    const storedToken = localStorage.getItem('token')
    const storedUserInfo = localStorage.getItem('userInfo')
    const storedPermissions = localStorage.getItem('permissions')

    if (storedToken) {
      // 检查token是否过期
      if (isTokenExpired(storedToken)) {
        console.warn('Token已过期，清除用户信息')
        clearUserInfo()
        return
      }

      token.value = storedToken

      // 如果没有缓存的权限信息，尝试从JWT解析
      if (!storedPermissions) {
        const jwtData = parseJwtToken(storedToken)
        if (jwtData) {
          permissions.value = jwtData.permissions || []
          localStorage.setItem('permissions', JSON.stringify(permissions.value))
        }
      }
    }

    if (storedUserInfo) userInfo.value = JSON.parse(storedUserInfo)
    if (storedPermissions) permissions.value = JSON.parse(storedPermissions)
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
    restoreUserInfo
  }
})
