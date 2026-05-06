// src/stores/language.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Language } from '@/types/language'
import {
  getLanguageList,
  getLanguageDetail
} from '@/api/language'

export const useLanguageStore = defineStore('language', () => {
  const languages = ref<Language[]>([])
  const currentLanguage = ref<Language | null>(null)
  const loading = ref(false)

  /**
   * Fetch enabled languages that can be used by client submissions.
   * GET /language/list
   */
  const fetchLanguages = async () => {
    loading.value = true
    try {
      const response = await getLanguageList()
      if (response.code === 200 && response.data) {
        languages.value = response.data
      }
    } catch (error) {
      console.error('Failed to fetch language list:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch enabled language detail by id and cache it locally.
   * GET /language/{id}
   */
  const fetchLanguageDetail = async (id: string) => {
    loading.value = true
    try {
      const response = await getLanguageDetail(id)
      if (response.code === 200 && response.data) {
        currentLanguage.value = response.data
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

  const getLanguageById = async (id: string): Promise<Language | null> => {
    const strId = String(id)
    const cached = languages.value.find(l => String(l.id) === strId)
    if (cached) return cached
    return await fetchLanguageDetail(id)
  }

  return {
    languages,
    currentLanguage,
    loading,
    fetchLanguages,
    fetchLanguageDetail,
    getLanguageById
  }
})
