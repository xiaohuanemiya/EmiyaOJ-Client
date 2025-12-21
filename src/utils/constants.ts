// src/utils/constants.ts

/**
 * 判题状态
 */
export const JUDGE_STATUS = {
  PENDING: 0,
  COMPILE_ERROR: 1,
  ACCEPTED: 2,
  WRONG_ANSWER: 3,
  TIME_LIMIT_EXCEEDED: 4,
  MEMORY_LIMIT_EXCEEDED: 5,
  RUNTIME_ERROR: 6,
  SYSTEM_ERROR: 7
} as const

/**
 * 判题状态文本
 */
export const JUDGE_STATUS_TEXT: Record<number, string> = {
  [JUDGE_STATUS.PENDING]: '判题中',
  [JUDGE_STATUS.COMPILE_ERROR]: '编译错误',
  [JUDGE_STATUS.ACCEPTED]: '答案正确',
  [JUDGE_STATUS.WRONG_ANSWER]: '答案错误',
  [JUDGE_STATUS.TIME_LIMIT_EXCEEDED]: '超时',
  [JUDGE_STATUS.MEMORY_LIMIT_EXCEEDED]: '内存超限',
  [JUDGE_STATUS.RUNTIME_ERROR]: '运行错误',
  [JUDGE_STATUS.SYSTEM_ERROR]: '系统错误'
}

/**
 * 题目难度
 */
export const PROBLEM_DIFFICULTY = {
  EASY: 0,
  MEDIUM: 1,
  HARD: 2
} as const

/**
 * 题目难度文本
 */
export const PROBLEM_DIFFICULTY_TEXT: Record<number, string> = {
  [PROBLEM_DIFFICULTY.EASY]: '简单',
  [PROBLEM_DIFFICULTY.MEDIUM]: '中等',
  [PROBLEM_DIFFICULTY.HARD]: '困难'
}

/**
 * 用户题目状态
 */
export const USER_PROBLEM_STATUS = {
  NOT_ATTEMPTED: 0,
  ATTEMPTED: 1,
  SOLVED: 2
} as const
