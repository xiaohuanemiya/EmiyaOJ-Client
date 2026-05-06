// src/api/submission.ts
import request from './request'
import type { ApiResponse, PageResult } from '@/types/api'
import type { Submission, SubmissionDetailVO, SubmitCodeParams, MySubmissionQueryParams } from '@/types/submission'

/**
 * 提交代码进行判题
 * POST /judge/submit
 */
export const submitCode = (data: SubmitCodeParams): Promise<ApiResponse<Submission>> => {
  return request({
    url: '/judge/submit',
    method: 'POST',
    data
  })
}

/**
 * 查询当前用户的提交记录（分页）
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
 * 查询提交详情（含测试用例明细）
 * GET /submission/{id}
 */
export const getSubmissionDetail = (id: string): Promise<ApiResponse<SubmissionDetailVO>> => {
  return request({
    url: `/submission/${id}`,
    method: 'GET'
  })
}
