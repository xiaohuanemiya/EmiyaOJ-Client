// stores/user.ts - 用户状态管理
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { authAPI } from '@/api/auth'
import router from '@/router'
import type { UserLoginDTO, UserLoginVO } from '@/types/api'
import { parseJwtToken, isTokenExpired } from '@/utils/jwt'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<UserLoginVO | null>(
    localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')!) : null
  )
  const permissions = ref<string[]>(
    localStorage.getItem('permissions') ? JSON.parse(localStorage.getItem('permissions')!) : []
  )

  /** 登录 */
  const login = async (loginForm: UserLoginDTO) => {
    try {
      const res = await authAPI.login(loginForm)
      const loginData = res.data.data
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
      clearUserInfo()
      return false
    }
    return true
  }

  /** 检查是否有权限 */
  const hasPermission = (permission: string): boolean => {
    return permissions.value.includes(permission)
  }

  /** 恢复用户信息（页面刷新时调用） */
  const restoreUserInfo = () => {
    const storedToken = localStorage.getItem('token')
    if (storedToken && !isTokenExpired(storedToken)) {
      token.value = storedToken
      
      const storedUserInfo = localStorage.getItem('userInfo')
      if (storedUserInfo) {
        userInfo.value = JSON.parse(storedUserInfo)
      }
      
      const storedPermissions = localStorage.getItem('permissions')
      if (storedPermissions) {
        permissions.value = JSON.parse(storedPermissions)
      } else {
        // 如果没有缓存的权限信息，尝试从JWT解析
        const jwtData = parseJwtToken(storedToken)
        if (jwtData) {
          permissions.value = jwtData.permissions || []
          localStorage.setItem('permissions', JSON.stringify(permissions.value))
        }
      }
    } else {
      clearUserInfo()
    }
  }

  return {
    token,
    userInfo,
    permissions,
    login,
    logout,
    isLoggedIn,
    hasPermission,
    restoreUserInfo,
    clearUserInfo
  }
})
