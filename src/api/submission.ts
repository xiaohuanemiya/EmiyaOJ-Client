// src/api/submission.ts
import request from './request'
import type { ApiResponse, PageResult } from '@/types/api'
import type { Submission, SubmitCodeParams, SubmissionQueryParams, MySubmissionQueryParams } from '@/types/submission'

/**
 * 提交代码进行判题
 * POST /judge/submit
 * 返回完整的提交记录对象
 */
export const submitCode = (data: SubmitCodeParams): Promise<ApiResponse<Submission>> => {
  return request({
    url: '/judge/submit',
    method: 'POST',
    data
  })
}

/**
 * 分页查询提交记录
 * GET /submission/page
 */
export const getSubmissionList = (
  params: SubmissionQueryParams
): Promise<ApiResponse<PageResult<Submission>>> => {
  return request({
    url: '/submission/page',
    method: 'GET',
    params
  })
}

/**
 * 查询当前用户的提交记录
 * GET /submission/my
 */
export const getMySubmissions = (
  params: MySubmissionQueryParams
): Promise<ApiResponse<PageResult<Submission>>> => {
  return request({
    url: '/submission/my',
    method: 'GET',
    params
  })
}

/**
 * 根据ID查询提交记录
 * GET /submission/{id}
 */
export const getSubmissionDetail = (id: string): Promise<ApiResponse<Submission>> => {
  return request({
    url: `/submission/${id}`,
    method: 'GET'
  })
}
