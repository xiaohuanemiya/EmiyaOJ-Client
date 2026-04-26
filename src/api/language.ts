// src/api/language.ts
import request from './request'
import type { ApiResponse } from '@/types/api'
import type { Language, LanguageSaveDTO } from '@/types/language'

/**
 * 查询启用的编程语言列表（前台）
 * GET /language/list
 */
export const getLanguageList = (): Promise<ApiResponse<Language[]>> => {
  return request({
    url: '/language/list',
    method: 'GET'
  })
}

/**
 * 管理端查询全部编程语言（含禁用）
 * GET /language/admin/list
 */
export const getLanguageAdminList = (): Promise<ApiResponse<Language[]>> => {
  return request({
    url: '/language/admin/list',
    method: 'GET'
  })
}

/**
 * 获取语言详情（仅返回启用状态）
 * GET /language/{id}
 */
export const getLanguageDetail = (id: string | number): Promise<ApiResponse<Language>> => {
  return request({
    url: `/language/${id}`,
    method: 'GET'
  })
}

/**
 * 管理端根据 ID 查询语言详情（不过滤状态）
 * GET /language/admin/{id}
 */
export const getLanguageAdminDetail = (id: string | number): Promise<ApiResponse<Language>> => {
  return request({
    url: `/language/admin/${id}`,
    method: 'GET'
  })
}

/**
 * 新增编程语言
 * POST /language
 */
export const createLanguage = (data: LanguageSaveDTO): Promise<ApiResponse<Language>> => {
  return request({
    url: '/language',
    method: 'POST',
    data
  })
}

/**
 * 更新编程语言信息
 * PUT /language
 */
export const updateLanguage = (data: LanguageSaveDTO): Promise<ApiResponse<Language>> => {
  return request({
    url: '/language',
    method: 'PUT',
    data
  })
}

/**
 * 启用编程语言
 * PUT /language/{id}/enable
 */
export const enableLanguage = (id: string | number): Promise<ApiResponse<boolean>> => {
  return request({
    url: `/language/${id}/enable`,
    method: 'PUT'
  })
}

/**
 * 禁用编程语言
 * PUT /language/{id}/disable
 */
export const disableLanguage = (id: string | number): Promise<ApiResponse<boolean>> => {
  return request({
    url: `/language/${id}/disable`,
    method: 'PUT'
  })
}

/**
 * 删除编程语言（物理删除，请谨慎操作）
 * DELETE /language/{id}
 */
export const deleteLanguage = (id: string | number): Promise<ApiResponse<null>> => {
  return request({
    url: `/language/${id}`,
    method: 'DELETE'
  })
}

