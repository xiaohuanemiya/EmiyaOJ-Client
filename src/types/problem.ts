// src/types/problem.ts

/**
 * 题目信息（题目详情 VO）
 */
export interface ProblemPicture {
  id: string
  problemId: string | null
  url: string
  contentType: string
  size: number
  originalFilename: string
  createTime: string
}

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
  pictures?: ProblemPicture[]
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

/**
 * 新增/更新题目参数（POST /problem  PUT /problem）
 */
export interface ProblemSaveDTO {
  id?: string            // 更新时必填
  title: string
  description: string
  inputDescription?: string
  outputDescription?: string
  sampleInput?: string
  sampleOutput?: string
  hint?: string
  difficulty: number     // 1-简单，2-中等，3-困难
  timeLimit: number      // CPU 时间限制（毫秒）
  memoryLimit: number    // 内存限制（MB）
  stackLimit?: number    // 栈内存限制（MB），默认 128
  source?: string
  status?: number        // 0-隐藏，1-公开，默认 1
  tagIds?: string[]      // 关联标签 ID 列表
  pictureIds?: string[]
}

// ===== 个性化学习推荐 =====

/**
 * 推荐题目
 */
export interface RecommendedProblem {
  problemId: string
  title: string
  difficulty: 1 | 2 | 3
  difficultyDesc: string
  tags: string[]
  acceptRate: number
  priority: number
  reason: string
}

/**
 * 个性化学习推荐 VO（GET /problem/recommend）
 */
export interface LearningPathRecommendation {
  userId: string
  traceId: string
  source: 'LLM' | 'STATIC_FALLBACK' | string
  model: string
  generatedAt: string
  summary: string
  learningPath: string[]
  weakTags: string[]
  targetDifficulty: 1 | 2 | 3
  recommendations: RecommendedProblem[]
}
