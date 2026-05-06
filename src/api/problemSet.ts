import request from './request'
import type { ApiResponse, PageResult } from '@/types/api'
import type {
  ProblemSetProblemDTO,
  ProblemSetQueryParams,
  ProblemSetSaveDTO,
  ProblemSetVO
} from '@/types/problemSet'

export const getProblemSetList = (
  params: ProblemSetQueryParams
): Promise<ApiResponse<PageResult<ProblemSetVO>>> => {
  return request({
    url: '/problem-set/list',
    method: 'GET',
    params
  })
}

export const getProblemSetDetail = (id: string): Promise<ApiResponse<ProblemSetVO>> => {
  return request({
    url: `/problem-set/${id}`,
    method: 'GET'
  })
}

export const createProblemSet = (data: ProblemSetSaveDTO): Promise<ApiResponse<ProblemSetVO>> => {
  return request({
    url: '/problem-set',
    method: 'POST',
    data
  })
}

export const updateProblemSet = (data: ProblemSetSaveDTO): Promise<ApiResponse<boolean>> => {
  return request({
    url: '/problem-set',
    method: 'PUT',
    data
  })
}

export const deleteProblemSet = (id: string): Promise<ApiResponse<boolean>> => {
  return request({
    url: `/problem-set/${id}`,
    method: 'DELETE'
  })
}

export const replaceProblemSetProblems = (
  id: string,
  data: ProblemSetProblemDTO[]
): Promise<ApiResponse<boolean>> => {
  return request({
    url: `/problem-set/${id}/problems`,
    method: 'PUT',
    data
  })
}

export const appendProblemSetProblems = (
  id: string,
  data: ProblemSetProblemDTO[]
): Promise<ApiResponse<boolean>> => {
  return request({
    url: `/problem-set/${id}/problems`,
    method: 'POST',
    data
  })
}

export const removeProblemSetProblem = (
  id: string,
  problemId: string
): Promise<ApiResponse<boolean>> => {
  return request({
    url: `/problem-set/${id}/problems/${problemId}`,
    method: 'DELETE'
  })
}
