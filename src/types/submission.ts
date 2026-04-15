// src/types/submission.ts

/**
 * 提交记录（提交记录 VO）
 */
export interface Submission {
  id: string
  problemId: string
  userId: string
  languageId: string
  status: number // 判题状态: 0-Pending, 1-Judging, 2-AC, 3-CE, 4-SE, 5-WA, 6-TLE, 7-MLE, 8-RE, 9-OLE, 10-PA
  score?: number
  timeUsed?: number // 使用时间（毫秒）
  memoryUsed?: number // 使用内存（KB）
  errorMessage?: string // 错误信息
  compileMessage?: string // 编译信息
  passRate?: string // 通过率
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
 * 提交记录查询参数（GET /submission/page 的 query 参数）
 */
export interface SubmissionQueryParams {
  pageNum?: number
  pageSize?: number
  problemId?: string
  userId?: string
}

/**
 * 当前用户提交记录查询参数（GET /submission/my 的 query 参数）
 */
export interface MySubmissionQueryParams {
  pageNum?: number
  pageSize?: number
  problemId?: string
}
