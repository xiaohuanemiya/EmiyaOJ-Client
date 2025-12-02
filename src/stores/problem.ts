import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { getProblemPage, getProblemDetail, type ProblemPageParams } from '@/api/problem'
import type { ProblemListItem, ProblemDetail, PageResponse } from '@/types'

export const useProblemStore = defineStore('problem', () => {
  // State
  const problems = ref<ProblemListItem[]>([])
  const currentProblem = ref<ProblemDetail | null>(null)
  const loading = ref(false)
  const pagination = ref({
    current: 1,
    size: 10,
    total: 0,
    pages: 0,
  })
  const filters = ref({
    difficulty: undefined as number | undefined,
    status: undefined as number | undefined,
    keyword: '',
  })

  // Getters
  const hasPrevPage = computed(() => pagination.value.current > 1)
  const hasNextPage = computed(() => pagination.value.current < pagination.value.pages)

  // Actions
  const fetchProblems = async (params?: Partial<ProblemPageParams>) => {
    loading.value = true
    try {
      const response = await getProblemPage({
        current: params?.current ?? pagination.value.current,
        size: params?.size ?? pagination.value.size,
        difficulty: params?.difficulty ?? filters.value.difficulty,
        status: params?.status ?? filters.value.status,
        keyword: (params?.keyword ?? filters.value.keyword) || undefined,
      })
      const data = response.data as PageResponse<ProblemListItem>
      problems.value = data.records
      pagination.value = {
        current: data.current,
        size: data.size,
        total: data.total,
        pages: data.pages,
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
      currentProblem.value = response.data
    } catch (error) {
      console.error('Failed to fetch problem detail:', error)
    } finally {
      loading.value = false
    }
  }

  const setPage = (page: number) => {
    pagination.value.current = page
    fetchProblems()
  }

  const setFilters = (newFilters: typeof filters.value) => {
    filters.value = newFilters
    pagination.value.current = 1
    fetchProblems()
  }

  const clearCurrentProblem = () => {
    currentProblem.value = null
  }

  return {
    // State
    problems,
    currentProblem,
    loading,
    pagination,
    filters,
    // Getters
    hasPrevPage,
    hasNextPage,
    // Actions
    fetchProblems,
    fetchProblemDetail,
    setPage,
    setFilters,
    clearCurrentProblem,
  }
})
