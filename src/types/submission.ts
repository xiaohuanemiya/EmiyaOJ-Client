// src/types/submission.ts
import type { PageQuery } from './api'

/**
 * 提交记录
 */
export interface Submission {
  id: number
  problemId: number
  problemTitle: string
  userId: number
  username: string
  language: string
  code?: string
  status: number
  time?: number
  memory?: number
  judgeInfo?: string
  createTime: string
}

/**
 * 代码提交参数
 */
export interface SubmitCodeParams {
  problemId: number
  languageId: number
  code: string
}

/**
 * 提交记录查询参数
 */
export interface SubmissionQueryParams extends PageQuery {
  problemId?: number
  userId?: number
}
