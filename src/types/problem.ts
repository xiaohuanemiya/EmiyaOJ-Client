// src/types/problem.ts

/**
 * 题目信息（题目详情 VO）
 */
export interface Problem {
  id: string
  title: string
  description: string
  inputDescription: string
  outputDescription: string
  sampleInput: string
  sampleOutput: string
  hint?: string
  difficulty: number
  difficultyDesc?: string
  timeLimit: number
  memoryLimit: number
  stackLimit?: number
  source?: string
  authorId?: string
  acceptCount: number
  submitCount: number
  status?: number
  tags?: string[]
  createTime: string
  updateTime?: string
}

/**
 * 题目示例
 */
export interface Example {
  input: string
  output: string
}

/**
 * 题目查询参数（GET /problem/list 的 query 参数）
 */
export interface ProblemQueryParams {
  pageNum?: number
  pageSize?: number
  title?: string
  difficulty?: number
  tagId?: string
  status?: number
}
