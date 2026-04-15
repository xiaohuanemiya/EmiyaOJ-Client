// src/api/problem.ts
import request from './request'
import type { ApiResponse, PageResult } from '@/types/api'
import type { Problem, ProblemQueryParams } from '@/types/problem'

/**
 * 分页查询题目列表
 * GET /problem/list
 */
export const getProblemList = (
  params: ProblemQueryParams
): Promise<ApiResponse<PageResult<Problem>>> => {
  return request({
    url: '/problem/list',
    method: 'GET',
    params
  })
}

/**
 * 获取题目详情
 * GET /problem/{id}
 */
export const getProblemDetail = (id: string | number): Promise<ApiResponse<Problem>> => {
  return request({
    url: `/problem/${id}`,
    method: 'GET'
  })
}
