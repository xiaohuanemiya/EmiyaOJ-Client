import api from './request'
import type { ApiResponse, PageResponse, ProblemListItem, ProblemDetail } from '@/types'

export interface ProblemPageParams {
  current: number
  size: number
  difficulty?: number
  status?: number
  keyword?: string
}

/**
 * Get paginated problem list
 */
export const getProblemPage = async (params: ProblemPageParams) => {
  const response = await api.get<ApiResponse<PageResponse<ProblemListItem>>>(
    '/client/problem/page',
    { params }
  )
  return response.data
}

/**
 * Get problem detail by ID
 */
export const getProblemDetail = async (id: number) => {
  const response = await api.get<ApiResponse<ProblemDetail>>(`/client/problem/${id}`)
  return response.data
}
