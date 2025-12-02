import api from './request'
import type { ApiResponse, Language } from '@/types'

/**
 * Get all available languages
 */
export const getLanguageList = async () => {
  const response = await api.get<ApiResponse<Language[]>>('/client/language/list')
  return response.data
}

/**
 * Get language detail by ID
 */
export const getLanguageDetail = async (id: number) => {
  const response = await api.get<ApiResponse<Language>>(`/client/language/${id}`)
  return response.data
}
