// src/api/language.ts
import request from './request'
import type { ApiResponse } from '@/types/api'
import type { Language } from '@/types/language'

/**
 * 获取所有可用语言
 */
export const getLanguageList = (): Promise<ApiResponse<Language[]>> => {
  return request({
    url: '/client/language/list',
    method: 'GET'
  })
}

/**
 * 获取语言详情
 */
export const getLanguageDetail = (id: number): Promise<ApiResponse<Language>> => {
  return request({
    url: `/client/language/${id}`,
    method: 'GET'
  })
}
