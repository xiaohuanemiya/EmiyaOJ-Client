// src/stores/auth.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginParams } from '@/types/user'
import { login as loginApi, logout as logoutApi } from '@/api/auth'
import { setToken, getToken, removeToken } from '@/utils/storage'

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string>(getToken() || '')
  const user = ref<User | null>(null)
  const isLoading = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const username = computed(() => user.value?.username || '')

  // Actions
  const login = async (params: LoginParams) => {
    isLoading.value = true
    try {
      const response = await loginApi(params)
      if (response.code === 200 && response.data) {
        token.value = response.data.token
        // Map LoginResponse to User
        user.value = {
          id: response.data.id,
          username: response.data.username,
          name: response.data.name
        }
        setToken(response.data.token)
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
      token.value = ''
      user.value = null
      removeToken()
    }
  }

  const setUserInfo = (userInfo: User) => {
    user.value = userInfo
  }

  return {
    token,
    user,
    isLoading,
    isAuthenticated,
    username,
    login,
    logout,
    setUserInfo
  }
})
