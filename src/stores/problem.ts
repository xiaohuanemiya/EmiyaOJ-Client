// src/stores/problem.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Problem, ProblemQueryParams } from '@/types/problem'
import { getProblemList, getProblemDetail } from '@/api/problem'

export const useProblemStore = defineStore('problem', () => {
  // State
  const problems = ref<Problem[]>([])
  const currentProblem = ref<Problem | null>(null)
  const total = ref(0)
  const loading = ref(false)

  // Actions
  const fetchProblems = async (params: ProblemQueryParams) => {
    loading.value = true
    try {
      const response = await getProblemList(params)
      if (response.code === 200 && response.data) {
        problems.value = response.data.records
        total.value = response.data.total
      }
    } catch (error) {
      console.error('Failed to fetch problems:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchProblemDetail = async (id: number) => {
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

  return {
    problems,
    currentProblem,
    total,
    loading,
    fetchProblems,
    fetchProblemDetail
  }
})
