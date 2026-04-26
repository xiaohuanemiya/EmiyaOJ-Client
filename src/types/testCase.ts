// src/types/testCase.ts

/**
 * 测试用例（TestCaseVO）
 */
export interface TestCase {
  id: string
  problemId: string
  input: string
  output: string
  isSample: number  // 0-否，1-是
  score: number
  sortOrder: number
}

/**
 * 新增/更新测试用例参数（POST /test-case  PUT /test-case）
 */
export interface TestCaseSaveDTO {
  id?: string        // 更新时必填
  problemId?: string // 新增单个时必填；批量新增时由路径参数决定，可省略
  input: string
  output: string
  isSample?: number  // 0-否，1-是，默认 0
  score?: number     // OI 模式分值，默认 0
  sortOrder?: number // 排序权重，默认 0
}
