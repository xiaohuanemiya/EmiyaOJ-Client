// src/stores/auth.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { jwtDecode } from 'jwt-decode'
import type { User, LoginParams, TokenPayload } from '@/types/user'
import { login as loginApi, logout as logoutApi } from '@/api/auth'
import { setToken, getToken, removeToken } from '@/utils/storage'

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string>(getToken() || '')
  const user = ref<User | null>(null)
  const permissions = ref<string[]>([])
  const isLoading = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !isTokenExpired())
  const username = computed(() => user.value?.username || '')

  /**
   * 检查 token 是否已过期
   */
  const isTokenExpired = (): boolean => {
    if (!token.value) return true
    try {
      const payload = jwtDecode<TokenPayload>(token.value)
      // exp 是秒级时间戳，Date.now() 是毫秒级
      return payload.exp * 1000 < Date.now()
    } catch {
      return true
    }
  }

  /**
   * 从 JWT token 中解析并装载用户信息和权限
   */
  const loadFromToken = (jwt: string) => {
    try {
      const payload = jwtDecode<TokenPayload>(jwt)

      // 检查 token 是否过期
      if (payload.exp * 1000 < Date.now()) {
        clearAuth()
        return false
      }

      // 装载用户基本信息
      user.value = {
        id: String(payload.userId),
        username: payload.username,
        nickname: '' // token 中不包含 nickname，登录时会被覆盖
      }

      // 装载权限列表
      permissions.value = payload.permissions || []

      return true
    } catch (error) {
      console.error('Failed to decode token:', error)
      clearAuth()
      return false
    }
  }

  /**
   * 清空认证状态
   */
  const clearAuth = () => {
    token.value = ''
    user.value = null
    permissions.value = []
    removeToken()
  }

  /**
   * 检查是否拥有某个权限
   */
  const hasPermission = (permission: string): boolean => {
    return permissions.value.includes(permission)
  }

  /**
   * 检查是否拥有任一权限
   */
  const hasAnyPermission = (...perms: string[]): boolean => {
    return perms.some((p) => permissions.value.includes(p))
  }

  // Actions
  const login = async (params: LoginParams) => {
    isLoading.value = true
    try {
      const response = await loginApi(params)
      if (response.code === 200 && response.data) {
        const { token: jwt, id, username: uname, nickname } = response.data

        // 保存 token
        token.value = jwt
        setToken(jwt)

        // 从 token 中解析权限
        loadFromToken(jwt)

        // 使用登录响应中更完整的用户信息覆盖（含 nickname）
        user.value = {
          id,
          username: uname,
          nickname
        }

        return true
      }
      return false
    } catch (error) {
      console.error('Login failed:', error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      await logoutApi()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      clearAuth()
    }
  }

  const setUserInfo = (userInfo: User) => {
    user.value = userInfo
  }

  // 初始化：页面加载/刷新时从 localStorage 中的 token 恢复状态
  if (token.value) {
    loadFromToken(token.value)
  }

  return {
    token,
    user,
    permissions,
    isLoading,
    isAuthenticated,
    username,
    login,
    logout,
    setUserInfo,
    hasPermission,
    hasAnyPermission,
    isTokenExpired,
    clearAuth
  }
})
