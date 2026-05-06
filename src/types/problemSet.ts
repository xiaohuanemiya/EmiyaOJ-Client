import type { Problem } from './problem'

export interface ProblemSetQueryParams {
  pageNum?: number
  pageSize?: number
  title?: string
  status?: number
  creatorId?: string
}

export interface ProblemSetProblemDTO {
  problemId: string
  sortOrder: number
  note?: string
}

export interface ProblemSetProblemVO {
  id: string
  setId: string
  problemId: string
  sortOrder: number
  note?: string
  problem?: Problem
  createTime?: string
}

export interface ProblemSetVO {
  id: string
  title: string
  description: string
  creatorId: string
  status: number
  problemCount: number
  problems?: ProblemSetProblemVO[]
  createTime: string
  updateTime?: string
}

export interface ProblemSetSaveDTO {
  id?: string
  title: string
  description?: string
  status: number
  problems?: ProblemSetProblemDTO[]
}
