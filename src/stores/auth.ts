// src/stores/auth.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { jwtDecode } from 'jwt-decode'
import type { User, LoginParams, RegisterParams, TokenPayload } from '@/types/user'
import { login as loginApi, register as registerApi, logout as logoutApi, parseToken as parseTokenApi } from '@/api/auth'
import { setToken, getToken, removeToken, setUser, getUser, removeUser } from '@/utils/storage'

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

      const cachedUser = getUser() as User | null
      const legacyPayload = payload as TokenPayload & {
        user_id?: string
        uid?: string
        UserId?: string
      }
      const userId = payload.userId
        || payload.id
        || payload.sub
        || legacyPayload.user_id
        || legacyPayload.uid
        || legacyPayload.UserId
        || cachedUser?.id
      const payloadUsername = payload.username || cachedUser?.username || ''

      if (!userId) {
        user.value = cachedUser
        permissions.value = payload.permissions || []
        return !!cachedUser
      }

      // 装载用户基本信息
      user.value = {
        id: String(userId),
        username: payloadUsername,
        nickname: cachedUser?.nickname || '',
        avatar: cachedUser?.avatar,
        createTime: cachedUser?.createTime
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
    removeUser()
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
        setUser(user.value)

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

  /**
   * 用户注册
   */
  const register = async (params: RegisterParams) => {
    isLoading.value = true
    try {
      const response = await registerApi(params)
      if (response.code === 200) {
        return { success: true, message: response.message || '注册成功' }
      }
      return { success: false, message: response.message || '注册失败' }
    } catch (error: any) {
      console.error('Register failed:', error)
      const message = error?.response?.data?.message || error?.message || '注册失败'
      return { success: false, message }
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
    setUser(userInfo)
  }

  /**
   * 从服务端解析 token 补齐用户 ID，用于兼容旧登录态刷新
   */
  const hydrateFromToken = async (): Promise<boolean> => {
    const existingId = user.value?.id
    if (existingId && existingId !== 'undefined' && existingId !== 'null') {
      return true
    }

    const jwt = token.value || getToken()
    if (!jwt) return false

    try {
      const response = await parseTokenApi(jwt)
      if (response.code === 200 && response.data?.userId) {
        token.value = jwt
        const cachedUser = getUser() as User | null
        user.value = {
          id: String(response.data.userId),
          username: response.data.username || cachedUser?.username || '',
          nickname: cachedUser?.nickname || response.data.username || '',
          avatar: cachedUser?.avatar,
          createTime: cachedUser?.createTime
        }
        permissions.value = response.data.permissions || []
        setUser(user.value)
        return true
      }
    } catch (error) {
      console.error('Failed to hydrate user from token:', error)
    }

    return false
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
    register,
    logout,
    setUserInfo,
    hydrateFromToken,
    hasPermission,
    hasAnyPermission,
    isTokenExpired,
    clearAuth
  }
})
