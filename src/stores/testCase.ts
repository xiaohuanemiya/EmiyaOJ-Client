// src/stores/testCase.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { TestCase, TestCaseSaveDTO } from '@/types/testCase'
import {
  getTestCasesByProblem,
  getTestCaseDetail,
  createTestCase,
  batchCreateTestCases,
  updateTestCase,
  deleteTestCase,
  batchDeleteTestCases,
  deleteTestCasesByProblem
} from '@/api/testCase'

export const useTestCaseStore = defineStore('testCase', () => {
  // State
  const testCases = ref<TestCase[]>([])
  const currentTestCase = ref<TestCase | null>(null)
  const loading = ref(false)

  // Actions

  /** 根据题目 ID 查询测试用例列表 */
  const fetchTestCases = async (problemId: string) => {
    loading.value = true
    try {
      const response = await getTestCasesByProblem(problemId)
      if (response.code === 200 && response.data) {
        testCases.value = response.data
      }
    } catch (error) {
      console.error('Failed to fetch test cases:', error)
    } finally {
      loading.value = false
    }
  }

  /** 根据 ID 查询单个测试用例 */
  const fetchTestCaseDetail = async (id: string) => {
    loading.value = true
    try {
      const response = await getTestCaseDetail(id)
      if (response.code === 200 && response.data) {
        currentTestCase.value = response.data
        return response.data
      }
      return null
    } catch (error) {
      console.error('Failed to fetch test case detail:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  /** 新增单个测试用例 */
  const addTestCase = async (data: TestCaseSaveDTO): Promise<TestCase | null> => {
    loading.value = true
    try {
      const response = await createTestCase(data)
      if (response.code === 200 && response.data) {
        testCases.value.push(response.data)
        return response.data
      }
      return null
    } catch (error) {
      console.error('Failed to create test case:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  /** 批量新增测试用例 */
  const addTestCasesBatch = async (
    problemId: string,
    data: TestCaseSaveDTO[]
  ): Promise<TestCase[]> => {
    loading.value = true
    try {
      const response = await batchCreateTestCases(problemId, data)
      if (response.code === 200 && response.data) {
        testCases.value.push(...response.data)
        return response.data
      }
      return []
    } catch (error) {
      console.error('Failed to batch create test cases:', error)
      return []
    } finally {
      loading.value = false
    }
  }

  /** 更新测试用例 */
  const editTestCase = async (data: TestCaseSaveDTO): Promise<TestCase | null> => {
    loading.value = true
    try {
      const response = await updateTestCase(data)
      if (response.code === 200 && response.data) {
        const idx = testCases.value.findIndex(t => t.id === data.id)
        if (idx >= 0) testCases.value[idx] = response.data
        if (currentTestCase.value?.id === data.id) currentTestCase.value = response.data
        return response.data
      }
      return null
    } catch (error) {
      console.error('Failed to update test case:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  /** 删除单个测试用例 */
  const removeTestCase = async (id: string): Promise<boolean> => {
    loading.value = true
    try {
      const response = await deleteTestCase(id)
      if (response.code === 200) {
        testCases.value = testCases.value.filter(t => String(t.id) !== String(id))
        if (String(currentTestCase.value?.id) === String(id)) currentTestCase.value = null
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to delete test case:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  /** 批量删除测试用例 */
  const removeTestCasesBatch = async (ids: string[]): Promise<boolean> => {
    loading.value = true
    try {
      const response = await batchDeleteTestCases(ids)
      if (response.code === 200) {
        const strIds = ids.map(String)
        testCases.value = testCases.value.filter(t => !strIds.includes(String(t.id)))
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to batch delete test cases:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  /** 清除指定题目下所有测试用例 */
  const removeTestCasesByProblem = async (problemId: string): Promise<boolean> => {
    loading.value = true
    try {
      const response = await deleteTestCasesByProblem(problemId)
      if (response.code === 200) {
        testCases.value = testCases.value.filter(
          t => String(t.problemId) !== String(problemId)
        )
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to delete test cases by problem:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  /** 清空本地列表（切换题目时调用） */
  const clearTestCases = () => {
    testCases.value = []
    currentTestCase.value = null
  }

  return {
    testCases,
    currentTestCase,
    loading,
    fetchTestCases,
    fetchTestCaseDetail,
    addTestCase,
    addTestCasesBatch,
    editTestCase,
    removeTestCase,
    removeTestCasesBatch,
    removeTestCasesByProblem,
    clearTestCases
  }
})
