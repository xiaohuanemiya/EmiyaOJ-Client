// src/stores/language.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Language } from '@/types/language'
import { getLanguageList } from '@/api/language'

export const useLanguageStore = defineStore('language', () => {
  // State
  const languages = ref<Language[]>([])
  const loading = ref(false)

  // Actions
  const fetchLanguages = async () => {
    loading.value = true
    try {
      const response = await getLanguageList()
      if (response.code === 200 && response.data) {
        languages.value = response.data
      }
    } catch (error) {
      console.error('Failed to fetch languages:', error)
    } finally {
      loading.value = false
    }
  }

  return {
    languages,
    loading,
    fetchLanguages
  }
})
