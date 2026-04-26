// src/stores/problem.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Problem, ProblemQueryParams, ProblemSaveDTO } from '@/types/problem'
import { getProblemList, getProblemDetail, createProblem, updateProblem, deleteProblem } from '@/api/problem'

export const useProblemStore = defineStore('problem', () => {
  // State
  const problems = ref<Problem[]>([])
  const currentProblem = ref<Problem | null>(null)
  const total = ref(0)
  const loading = ref(false)

  // Actions

  /** 分页查询题目列表 */
  const fetchProblems = async (params: ProblemQueryParams) => {
    loading.value = true
    try {
      const response = await getProblemList(params)
      if (response.code === 200 && response.data) {
        problems.value = response.data.list
        total.value = response.data.total
      }
    } catch (error) {
      console.error('Failed to fetch problems:', error)
    } finally {
      loading.value = false
    }
  }

  /** 获取题目详情 */
  const fetchProblemDetail = async (id: string | number) => {
    loading.value = true
    try {
      const response = await getProblemDetail(id)
      if (response.code === 200 && response.data) {
        currentProblem.value = response.data
      }
    } catch (error) {
      console.error('Failed to fetch problem detail:', error)
    } finally {
      loading.value = false
    }
  }

  /** 新增题目 */
  const addProblem = async (data: ProblemSaveDTO): Promise<Problem | null> => {
    loading.value = true
    try {
      const response = await createProblem(data)
      if (response.code === 200 && response.data) {
        return response.data
      }
      return null
    } catch (error) {
      console.error('Failed to create problem:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  /** 更新题目 */
  const editProblem = async (data: ProblemSaveDTO): Promise<Problem | null> => {
    loading.value = true
    try {
      const response = await updateProblem(data)
      if (response.code === 200 && response.data) {
        // 同步更新本地缓存
        if (currentProblem.value?.id === data.id) {
          currentProblem.value = response.data
        }
        const idx = problems.value.findIndex(p => p.id === data.id)
        if (idx >= 0) problems.value[idx] = response.data
        return response.data
      }
      return null
    } catch (error) {
      console.error('Failed to update problem:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  /** 删除题目（逻辑删除） */
  const removeProblem = async (id: string | number): Promise<boolean> => {
    loading.value = true
    try {
      const response = await deleteProblem(id)
      if (response.code === 200) {
        // 从本地列表移除
        problems.value = problems.value.filter(p => p.id !== String(id))
        if (currentProblem.value?.id === String(id)) {
          currentProblem.value = null
        }
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to delete problem:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    problems,
    currentProblem,
    total,
    loading,
    fetchProblems,
    fetchProblemDetail,
    addProblem,
    editProblem,
    removeProblem
  }
})
