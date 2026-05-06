import type { Problem } from './problem'

export interface ContestQueryParams {
  pageNum?: number
  pageSize?: number
  title?: string
  ruleType?: number
  status?: number
  startFrom?: string
  startTo?: string
}

export interface ContestProblemVO {
  id: string
  contestId: string
  problemId: string
  label: string
  sortOrder: number
  score: number
  problem?: Problem
  createTime?: string
}

export interface ContestVO {
  id: string
  title: string
  description: string
  ruleType: number
  ruleTypeDesc?: string
  startTime: string
  endTime: string
  freezeBeforeMinutes?: number
  inviteCode?: string
  status: number
  creatorId: string
  registered?: boolean
  admin?: boolean
  registrationCount?: number
  adminUserIds?: string[]
  problems?: ContestProblemVO[]
  createTime: string
  updateTime?: string
}

export interface ContestRegisterDTO {
  inviteCode?: string
}

export interface ContestRankProblemVO {
  contestProblemId: string
  problemId: string
  label: string
  score: number
  accepted: boolean
  submissionCount: number
  wrongBeforeAccepted: number
  penalty: number
  lastSubmitTime?: string
}

export interface ContestRankUserVO {
  rank: number
  userId: string
  username?: string
  nickname?: string
  solvedCount: number
  totalScore: number
  penalty: number
  lastSubmitTime?: string
  problems?: ContestRankProblemVO[]
}

export interface ContestRankVO {
  contestId: string
  ruleType: number
  frozen: boolean
  freezeTime?: string
  rankings: ContestRankUserVO[]
}
