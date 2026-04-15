// src/stores/language.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Language } from '@/types/language'
import { getLanguageDetail } from '@/api/language'

export const useLanguageStore = defineStore('language', () => {
  // State
  const languages = ref<Language[]>([])
  const currentLanguage = ref<Language | null>(null)
  const loading = ref(false)

  // Actions

  /**
   * 根据 ID 获取语言详情
   * 新接口仅支持按 ID 查询详情，不再有 list 接口
   */
  const fetchLanguageDetail = async (id: string | number) => {
    loading.value = true
    try {
      const response = await getLanguageDetail(id)
      if (response.code === 200 && response.data) {
        currentLanguage.value = response.data
        // 将获取到的语言缓存到列表中（避免重复请求）
        const strId = String(id)
        const idx = languages.value.findIndex(l => String(l.id) === strId)
        if (idx >= 0) {
          languages.value[idx] = response.data
        } else {
          languages.value.push(response.data)
        }
        return response.data
      }
      return null
    } catch (error) {
      console.error('Failed to fetch language detail:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 根据 ID 从缓存中获取语言，若无缓存则请求接口
   */
  const getLanguageById = async (id: string | number): Promise<Language | null> => {
    const strId = String(id)
    const cached = languages.value.find(l => String(l.id) === strId)
    if (cached) return cached
    return await fetchLanguageDetail(id)
  }

  return {
    languages,
    currentLanguage,
    loading,
    fetchLanguageDetail,
    getLanguageById
  }
})
