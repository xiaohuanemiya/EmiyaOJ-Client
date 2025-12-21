// src/types/problem.ts
import type { PageQuery } from './api'

/**
 * 题目信息
 */
export interface Problem {
  id: number
  title: string
  description: string
  inputDescription: string
  outputDescription: string
  sampleInput: string
  sampleOutput: string
  hint?: string
  timeLimit: number
  memoryLimit: number
  difficulty: number
  acceptCount: number
  submitCount: number
  tags?: string[]
  userStatus?: number
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
