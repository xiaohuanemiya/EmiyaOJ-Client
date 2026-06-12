// src/api/submission.ts
import request from './request'
import type { ApiResponse, PageResult } from '@/types/api'
import type {
  JudgeFeedbackVO,
  Submission,
  SubmissionDetailVO,
  SubmitCodeParams,
  MySubmissionQueryParams
} from '@/types/submission'

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

/**
 * 查询提交的智能判题反馈
 * GET /submission/{id}/feedback
 *
 * data 为 null 表示反馈仍在生成或 Agent 没有输出。
 * 业务码 404 表示提交不存在。
 */
export const getSubmissionFeedback = (id: string): Promise<ApiResponse<JudgeFeedbackVO | null>> => {
  return request({
    url: `/submission/${id}/feedback`,
    method: 'GET'
  })
}
