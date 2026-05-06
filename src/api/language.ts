// src/api/language.ts
import request from './request'
import type { ApiResponse } from '@/types/api'
import type { Language } from '@/types/language'

/**
 * Get enabled programming languages for client-side code submission.
 * GET /language/list
 */
export const getLanguageList = (): Promise<ApiResponse<Language[]>> => {
  return request({
    url: '/language/list',
    method: 'GET'
  })
}

/**
 * Get enabled programming language detail by id.
 * GET /language/{id}
 */
export const getLanguageDetail = (id: string): Promise<ApiResponse<Language>> => {
  return request({
    url: `/language/${id}`,
    method: 'GET'
  })
}
