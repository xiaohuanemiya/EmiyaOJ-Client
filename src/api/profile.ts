import request from './request'
import { useAuthStore } from '@/stores/auth'
import { getUser } from '@/utils/storage'
import type { ApiResponse, PageResult } from '@/types/api'
import type {
  ProfileCenterVO,
  SolvedProblemQueryParams,
  SolvedProblemVO
} from '@/types/profile'

const getUserIdHeader = () => {
  const authStore = useAuthStore()
  const cachedUser = getUser()
  const userId = authStore.user?.id || cachedUser?.id
  return userId && userId !== 'undefined' && userId !== 'null'
    ? { 'X-User-Id': String(userId) }
    : {}
}

/**
 * 查询当前登录用户个人中心总览
 * GET /user/center/me
 */
export const getMyProfileCenter = (): Promise<ApiResponse<ProfileCenterVO>> => {
  return request({
    url: '/user/center/me',
    method: 'GET',
    headers: getUserIdHeader()
  })
}

/**
 * 查询指定用户公开个人中心总览
 * GET /user/center/{userId}
 */
export const getUserProfileCenter = (
  userId: string
): Promise<ApiResponse<ProfileCenterVO>> => {
  return request({
    url: `/user/center/${userId}`,
    method: 'GET'
  })
}

/**
 * 分页查询用户已解决题目
 * GET /submission/user/{userId}/solved
 */
export const queryUserSolvedProblems = (
  userId: string,
  params: SolvedProblemQueryParams
): Promise<ApiResponse<PageResult<SolvedProblemVO>>> => {
  return request({
    url: `/submission/user/${userId}/solved`,
    method: 'GET',
    params
  })
}
