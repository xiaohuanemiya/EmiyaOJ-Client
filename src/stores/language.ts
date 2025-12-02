import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getLanguageList, getLanguageDetail } from '@/api/language'
import type { Language } from '@/types'

export const useLanguageStore = defineStore('language', () => {
  // State
  const languages = ref<Language[]>([])
  const currentLanguage = ref<Language | null>(null)
  const loading = ref(false)

  // Actions
  const fetchLanguages = async () => {
    if (languages.value.length > 0) {
      return // Already loaded
    }
    loading.value = true
    try {
      const response = await getLanguageList()
      languages.value = response.data
    } catch (error) {
      console.error('Failed to fetch languages:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchLanguageDetail = async (id: number) => {
    loading.value = true
    try {
      const response = await getLanguageDetail(id)
      currentLanguage.value = response.data
    } catch (error) {
      console.error('Failed to fetch language detail:', error)
    } finally {
      loading.value = false
    }
  }

  const getLanguageById = (id: number) => {
    return languages.value.find((lang) => lang.id === id)
  }

  return {
    // State
    languages,
    currentLanguage,
    loading,
    // Actions
    fetchLanguages,
    fetchLanguageDetail,
    getLanguageById,
  }
})
