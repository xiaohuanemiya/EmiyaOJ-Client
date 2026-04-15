// src/types/api.ts

/**
 * 统一API响应格式
 */
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

/**
 * 分页结果（后端统一分页包装）
 */
export interface PageResult<T> {
  list: T[]
  total: number
  pageNum: number
  pageSize: number
}

/**
 * 分页查询参数（博客模块使用 pageNo/pageSize）
 */
export interface PageQuery {
  pageNo: number
  pageSize: number
}
