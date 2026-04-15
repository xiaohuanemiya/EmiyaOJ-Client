// src/types/language.ts

/**
 * 编程语言信息（编程语言 VO）
 */
export interface Language {
  id: string
  name: string
  version?: string
  compileCommand?: string
  executeCommand?: string
  sourceFileExt?: string
  executableExt?: string
  isCompiled?: number
  timeLimitMultiplier?: number
  memoryLimitMultiplier?: number
  status: number
}
