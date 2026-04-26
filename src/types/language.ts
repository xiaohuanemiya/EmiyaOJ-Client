// src/types/language.ts

/**
 * 编程语言信息（LanguageVO）
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

/**
 * 新增/更新编程语言参数（POST /language  PUT /language）
 */
export interface LanguageSaveDTO {
  id?: string            // 更新时必填
  name: string
  version?: string
  compileCommand?: string
  executeCommand?: string
  sourceFileExt?: string
  executableExt?: string
  isCompiled?: number    // 0-否，1-是
  timeLimitMultiplier?: number   // 默认 1.0
  memoryLimitMultiplier?: number // 默认 1.0
  status?: number        // 0-禁用，1-启用，默认 1
}
