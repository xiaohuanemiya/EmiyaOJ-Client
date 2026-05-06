// src/types/language.ts

/**
 * Programming language information returned by /language/list and /language/{id}.
 */
export interface Language {
  id: string
  name: string
  version: string
  languageVersion: string
  compileFileName?: string | null
  sourceFileExt: string
  executableFileName?: string | null
  compiledFileNames?: string | null
  compileCommand?: string | null
  runCommand: string
  envVars?: string | null
  isCompiled: number
  timeLimitMultiplier: number
  memoryLimitMultiplier: number
  compileTimeLimit: number
  compileMemoryLimit: number
  compileProcLimit: number
  runProcLimit: number
  status: number
}
