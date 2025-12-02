import api from './request'
import type {
  ApiResponse,
  PageResponse,
  SubmissionListItem,
  SubmissionDetail,
  SubmitCodeRequest,
} from '@/types'

export interface SubmissionPageParams {
  current: number
  size: number
  problemId?: number
  userId?: number
}

/**
 * Submit code for judging
 */
export const submitCode = async (data: SubmitCodeRequest) => {
  const response = await api.post<ApiResponse<number>>(
    '/client/submission/client/submit',
    data
  )
  return response.data
}

/**
 * Get paginated submission list
 */
export const getSubmissionPage = async (params: SubmissionPageParams) => {
  const response = await api.get<ApiResponse<PageResponse<SubmissionListItem>>>(
    '/client/submission/page',
    { params }
  )
  return response.data
}

/**
 * Get submission detail by ID
 */
export const getSubmissionDetail = async (id: number) => {
  const response = await api.get<ApiResponse<SubmissionDetail>>(
    `/client/submission/${id}`
  )
  return response.data
}
