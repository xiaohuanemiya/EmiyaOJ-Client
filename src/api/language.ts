// src/api/language.ts
import request from './request'
import type { ApiResponse } from '@/types/api'
import type { Language } from '@/types/language'

/**
 * 获取语言详情
 * GET /language/{id}
 * 注意：新接口没有 list 接口，仅支持按 ID 查询详情
 */
export const getLanguageDetail = (id: string | number): Promise<ApiResponse<Language>> => {
  return request({
    url: `/language/${id}`,
    method: 'GET'
  })
}
