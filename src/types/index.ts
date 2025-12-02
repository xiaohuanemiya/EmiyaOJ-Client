// Common API Response type
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// Pagination response type
export interface PageResponse<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

// Problem types
export interface ProblemListItem {
  id: number
  title: string
  difficulty: number
  passRate: number
  tags: string[]
  userStatus: number
}

export interface ProblemDetail {
  id: number
  title: string
  description: string
  inputFormat: string
  outputFormat: string
  examples: { input: string; output: string }[]
  timeLimit: number
  memoryLimit: number
  difficulty: number
  passRate: number
  tags: string[]
  userStatus: number
}

// Submission types
export interface SubmissionListItem {
  id: number
  problemId: number
  problemTitle: string
  userId: number
  username: string
  language: string
  status: number
  time: number
  memory: number
  createTime: string
}

export interface SubmissionDetail {
  id: number
  problemId: number
  problemTitle: string
  userId: number
  username: string
  language: string
  code: string
  status: number
  time: number
  memory: number
  judgeInfo: string
  createTime: string
}

export interface SubmitCodeRequest {
  problemId: number
  languageId: number
  code: string
}

// Language types
export interface Language {
  id: number
  name: string
  description: string
  status: number
  createTime: string
  updateTime: string
}

// Enums for status values
export const SubmissionStatus = {
  JUDGING: 0,
  COMPILE_ERROR: 1,
  ACCEPTED: 2,
  WRONG_ANSWER: 3,
  TIME_LIMIT_EXCEEDED: 4,
  MEMORY_LIMIT_EXCEEDED: 5,
} as const

export const SubmissionStatusText: Record<number, string> = {
  0: '判题中',
  1: '编译错误',
  2: '答案正确',
  3: '答案错误',
  4: '超时',
  5: '内存超限',
}

export const ProblemDifficulty = {
  EASY: 0,
  MEDIUM: 1,
  HARD: 2,
} as const

export const ProblemDifficultyText: Record<number, string> = {
  0: '简单',
  1: '中等',
  2: '困难',
}

export const UserProblemStatus = {
  NOT_ATTEMPTED: 0,
  ATTEMPTED: 1,
  PASSED: 2,
} as const

export const UserProblemStatusText: Record<number, string> = {
  0: '未尝试',
  1: '尝试过',
  2: '已通过',
}
