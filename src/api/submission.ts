// src/api/submission.ts
import request from './request'
import type { ApiResponse, PageResult } from '@/types/api'
import type { Submission, SubmitCodeParams, SubmissionQueryParams } from '@/types/submission'

/**
 * 提交代码
 */
export const submitCode = (data: SubmitCodeParams): Promise<ApiResponse<number>> => {
  return request({
    url: '/client/submission/submit',
    method: 'POST',
    data
  })
}

/**
 * 分页查询提交记录
 */
export const getSubmissionList = (
  params: SubmissionQueryParams
): Promise<ApiResponse<PageResult<Submission>>> => {
  return request({
    url: '/client/submission/page',
    method: 'GET',
    params
  })
}

/**
 * 获取提交详情
 */
export const getSubmissionDetail = (id: number): Promise<ApiResponse<Submission>> => {
  return request({
    url: `/client/submission/${id}`,
    method: 'GET'
  })
}
