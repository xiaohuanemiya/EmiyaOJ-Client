// src/stores/language.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Language, LanguageSaveDTO } from '@/types/language'
import {
  getLanguageList,
  getLanguageAdminList,
  getLanguageDetail,
  createLanguage,
  updateLanguage,
  enableLanguage,
  disableLanguage,
  deleteLanguage
} from '@/api/language'

export const useLanguageStore = defineStore('language', () => {
  // State
  const languages = ref<Language[]>([])
  const currentLanguage = ref<Language | null>(null)
  const loading = ref(false)

  // Actions

  /**
   * 获取启用的编程语言列表（前台）
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
   * 管理端获取全部编程语言（含禁用）
   * GET /language/admin/list
   */
  const fetchAllLanguages = async () => {
    loading.value = true
    try {
      const response = await getLanguageAdminList()
      if (response.code === 200 && response.data) {
        languages.value = response.data
      }
    } catch (error) {
      console.error('Failed to fetch admin language list:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * 根据 ID 获取语言详情，并缓存到列表中
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

  /**
   * 根据 ID 从缓存中获取语言，若无缓存则请求接口
   */
  const getLanguageById = async (id: string): Promise<Language | null> => {
    const strId = String(id)
    const cached = languages.value.find(l => String(l.id) === strId)
    if (cached) return cached
    return await fetchLanguageDetail(id)
  }

  /** 新增编程语言 */
  const addLanguage = async (data: LanguageSaveDTO): Promise<Language | null> => {
    loading.value = true
    try {
      const response = await createLanguage(data)
      if (response.code === 200 && response.data) {
        languages.value.push(response.data)
        return response.data
      }
      return null
    } catch (error) {
      console.error('Failed to create language:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  /** 更新编程语言 */
  const editLanguage = async (data: LanguageSaveDTO): Promise<boolean> => {
    if (!data.id) return false

    loading.value = true
    try {
      const response = await updateLanguage(data)
      if (response.code === 200 && response.data) {
        const strId = String(data.id)
        const idx = languages.value.findIndex(l => String(l.id) === strId)
        if (idx >= 0) {
          const cachedLanguage = languages.value[idx]
          if (cachedLanguage) {
            languages.value[idx] = {
              ...cachedLanguage,
              ...data,
              id: strId,
              status: data.status ?? cachedLanguage.status
            }
          }
        }
        if (String(currentLanguage.value?.id) === strId && currentLanguage.value) {
          currentLanguage.value = {
            ...currentLanguage.value,
            ...data,
            id: strId,
            status: data.status ?? currentLanguage.value.status
          }
        }
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to update language:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  /** 启用编程语言 */
  const toggleLanguageEnable = async (id: string, enable: boolean): Promise<boolean> => {
    loading.value = true
    try {
      const response = enable ? await enableLanguage(id) : await disableLanguage(id)
      if (response.code === 200) {
        const strId = String(id)
        const lang = languages.value.find(l => String(l.id) === strId)
        if (lang) lang.status = enable ? 1 : 0
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to toggle language status:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  /** 删除编程语言（物理删除） */
  const removeLanguage = async (id: string): Promise<boolean> => {
    loading.value = true
    try {
      const response = await deleteLanguage(id)
      if (response.code === 200) {
        languages.value = languages.value.filter(l => String(l.id) !== String(id))
        if (String(currentLanguage.value?.id) === String(id)) currentLanguage.value = null
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to delete language:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    languages,
    currentLanguage,
    loading,
    fetchLanguages,
    fetchAllLanguages,
    fetchLanguageDetail,
    getLanguageById,
    addLanguage,
    editLanguage,
    toggleLanguageEnable,
    removeLanguage
  }
})
