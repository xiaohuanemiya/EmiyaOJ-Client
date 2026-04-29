// src/types/submission.ts

/**
 * 提交记录 VO（与后端 SubmissionVO 对齐）
 * 判题状态码: 0-PENDING, 1-JUDGING, 2-AC, 3-CE, 4-SE, 5-WA, 6-TLE, 7-MLE, 8-RE, 9-OLE, 10-PA
 */
export interface Submission {
  id: string
  problemId: string
  userId: string
  languageId: string
  status: number
  passedCaseCount: number
  totalCaseCount: number
  score: number
  maxTimeUsed: number
  maxMemoryUsed: number
  errorMessage: string | null
  compileMessage: string | null
  createTime: string
  finishTime: string | null
}

/**
 * 提交详情 VO（含测试用例明细）
 */
export interface SubmissionDetailVO extends Submission {
  caseResults: SubmissionCaseResultVO[]
}

/**
 * 测试用例判题明细
 */
export interface SubmissionCaseResultVO {
  id: string
  submissionId: string
  testCaseId: string
  caseOrder: number
  status: number
  score: number
  timeUsed: number
  memoryUsed: number
  errorMessage: string | null
  createTime: string
}

/**
 * 代码提交参数（POST /judge/submit）
 */
export interface SubmitCodeParams {
  problemId: string
  languageId: string
  code: string
}

/**
 * 当前用户提交记录查询参数（GET /submission/my 的 query 参数）
 */
export interface MySubmissionQueryParams {
  pageNum?: number
  pageSize?: number
  problemId?: string
}
