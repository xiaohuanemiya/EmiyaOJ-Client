import request from './request'
import type { ApiResponse, PageResult } from '@/types/api'
import type {
  ContestQueryParams,
  ContestRegisterDTO,
  ContestRankVO,
  ContestVO
} from '@/types/contest'

export const getContestList = (
  params: ContestQueryParams
): Promise<ApiResponse<PageResult<ContestVO>>> => {
  return request({
    url: '/contest/list',
    method: 'GET',
    params
  })
}

export const getContestDetail = (id: string): Promise<ApiResponse<ContestVO>> => {
  return request({
    url: `/contest/${id}`,
    method: 'GET'
  })
}

export const registerContest = (
  id: string,
  data: ContestRegisterDTO
): Promise<ApiResponse<boolean>> => {
  return request({
    url: `/contest/${id}/register`,
    method: 'POST',
    data
  })
}

export const cancelContestRegistration = (id: string): Promise<ApiResponse<boolean>> => {
  return request({
    url: `/contest/${id}/register`,
    method: 'DELETE'
  })
}

export const getContestRank = (id: string): Promise<ApiResponse<ContestRankVO>> => {
  return request({
    url: `/contest/${id}/rank`,
    method: 'GET'
  })
}
