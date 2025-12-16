// src/types/api.ts

/**
 * 统一API响应格式
 */
export interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
}

/**
 * 分页结果
 */
export interface PageResult<T> {
  list: T[]
  total: number
  pages: number
}

/**
 * 分页查询参数
 */
export interface PageQuery {
  pageNo: number
  pageSize: number
}
