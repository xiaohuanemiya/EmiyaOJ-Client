// src/api/problem.ts
import request from './request'
import type { ApiResponse, PageResult } from '@/types/api'
import type { Problem, ProblemQueryParams } from '@/types/problem'

/**
 * 分页查询题目列表
 */
export const getProblemList = (
  params: ProblemQueryParams
): Promise<ApiResponse<PageResult<Problem>>> => {
  return request({
    url: '/client/problem/page',
    method: 'GET',
    params
  })
}

/**
 * 获取题目详情
 */
export const getProblemDetail = (id: number): Promise<ApiResponse<Problem>> => {
  return request({
    url: `/client/problem/${id}`,
    method: 'GET'
  })
}
