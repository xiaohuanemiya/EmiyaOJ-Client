// src/api/testCase.ts
import request from './request'
import type { ApiResponse } from '@/types/api'
import type { TestCase, TestCaseSaveDTO } from '@/types/testCase'

/**
 * 根据题目 ID 查询测试用例列表
 * GET /test-case/problem/{problemId}
 */
export const getTestCasesByProblem = (
  problemId: string | number
): Promise<ApiResponse<TestCase[]>> => {
  return request({
    url: `/test-case/problem/${problemId}`,
    method: 'GET'
  })
}

/**
 * 根据 ID 查询单个测试用例
 * GET /test-case/{id}
 */
export const getTestCaseDetail = (id: string | number): Promise<ApiResponse<TestCase>> => {
  return request({
    url: `/test-case/${id}`,
    method: 'GET'
  })
}

/**
 * 新增单个测试用例
 * POST /test-case
 */
export const createTestCase = (data: TestCaseSaveDTO): Promise<ApiResponse<TestCase>> => {
  return request({
    url: '/test-case',
    method: 'POST',
    data
  })
}

/**
 * 批量新增测试用例
 * POST /test-case/batch/{problemId}
 */
export const batchCreateTestCases = (
  problemId: string | number,
  data: TestCaseSaveDTO[]
): Promise<ApiResponse<TestCase[]>> => {
  return request({
    url: `/test-case/batch/${problemId}`,
    method: 'POST',
    data
  })
}

/**
 * 更新测试用例
 * PUT /test-case
 */
export const updateTestCase = (data: TestCaseSaveDTO): Promise<ApiResponse<TestCase>> => {
  return request({
    url: '/test-case',
    method: 'PUT',
    data
  })
}

/**
 * 删除单个测试用例（逻辑删除）
 * DELETE /test-case/{id}
 */
export const deleteTestCase = (id: string | number): Promise<ApiResponse<null>> => {
  return request({
    url: `/test-case/${id}`,
    method: 'DELETE'
  })
}

/**
 * 批量删除测试用例
 * DELETE /test-case/batch
 */
export const batchDeleteTestCases = (ids: (string | number)[]): Promise<ApiResponse<null>> => {
  return request({
    url: '/test-case/batch',
    method: 'DELETE',
    data: ids
  })
}

/**
 * 删除题目下所有测试用例
 * DELETE /test-case/problem/{problemId}
 */
export const deleteTestCasesByProblem = (
  problemId: string | number
): Promise<ApiResponse<null>> => {
  return request({
    url: `/test-case/problem/${problemId}`,
    method: 'DELETE'
  })
}
