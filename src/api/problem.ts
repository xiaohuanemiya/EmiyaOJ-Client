// src/api/problem.ts
import request from './request'
import type { ApiResponse, PageResult } from '@/types/api'
import type { Problem, ProblemQueryParams, ProblemSaveDTO } from '@/types/problem'

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
export const getProblemDetail = (id: string): Promise<ApiResponse<Problem>> => {
  return request({
    url: `/problem/${id}`,
    method: 'GET'
  })
}

/**
 * 新增题目
 * POST /problem
 */
export const createProblem = (data: ProblemSaveDTO): Promise<ApiResponse<Problem>> => {
  return request({
    url: '/problem',
    method: 'POST',
    data
  })
}

/**
 * 更新题目
 * PUT /problem
 */
export const updateProblem = (data: ProblemSaveDTO): Promise<ApiResponse<Problem>> => {
  return request({
    url: '/problem',
    method: 'PUT',
    data
  })
}

/**
 * 删除题目（逻辑删除）
 * DELETE /problem/{id}
 */
export const deleteProblem = (id: string): Promise<ApiResponse<null>> => {
  return request({
    url: `/problem/${id}`,
    method: 'DELETE'
  })
}

