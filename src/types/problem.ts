// src/types/problem.ts
import type { PageQuery } from './api'

/**
 * 题目信息
 */
export interface Problem {
  id: number
  title: string
  description: string
  inputFormat: string
  outputFormat: string
  examples: Example[]
  timeLimit: number
  memoryLimit: number
  difficulty: number
  passRate: number
  tags: string[]
  userStatus: number
  acceptCount?: number
  submitCount?: number
  createTime: string
}

/**
 * 题目示例
 */
export interface Example {
  input: string
  output: string
}

/**
 * 题目查询参数
 */
export interface ProblemQueryParams extends PageQuery {
  difficulty?: number
  status?: number
  keyword?: string
}
