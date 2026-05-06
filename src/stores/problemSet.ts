import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { PageResult } from '@/types/api'
import type {
  ProblemSetProblemDTO,
  ProblemSetQueryParams,
  ProblemSetSaveDTO,
  ProblemSetVO
} from '@/types/problemSet'
import {
  appendProblemSetProblems,
  createProblemSet,
  deleteProblemSet,
  getProblemSetDetail,
  getProblemSetList,
  removeProblemSetProblem,
  replaceProblemSetProblems,
  updateProblemSet
} from '@/api/problemSet'

const getPageItems = <T>(page: PageResult<T>): T[] => {
  const candidate = page as PageResult<T> & { records?: T[]; rows?: T[] }
  return candidate.list || candidate.records || candidate.rows || []
}

export const useProblemSetStore = defineStore('problemSet', () => {
  const problemSets = ref<ProblemSetVO[]>([])
  const currentProblemSet = ref<ProblemSetVO | null>(null)
  const total = ref(0)
  const loading = ref(false)
  const detailLoading = ref(false)

  const fetchProblemSets = async (params: ProblemSetQueryParams) => {
    loading.value = true
    try {
      const response = await getProblemSetList(params)
      if (response.code === 200 && response.data) {
        problemSets.value = getPageItems(response.data)
        total.value = response.data.total || 0
      }
    } catch (error) {
      console.error('Failed to fetch problem sets:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchProblemSetDetail = async (id: string) => {
    detailLoading.value = true
    try {
      const response = await getProblemSetDetail(id)
      if (response.code === 200 && response.data) {
        currentProblemSet.value = response.data
      }
    } catch (error) {
      console.error('Failed to fetch problem set detail:', error)
    } finally {
      detailLoading.value = false
    }
  }

  const addProblemSet = async (data: ProblemSetSaveDTO): Promise<ProblemSetVO | null> => {
    const response = await createProblemSet(data)
    return response.code === 200 && response.data ? response.data : null
  }

  const editProblemSet = async (data: ProblemSetSaveDTO): Promise<boolean> => {
    const response = await updateProblemSet(data)
    if (response.code === 200 && data.id && currentProblemSet.value?.id === data.id) {
      await fetchProblemSetDetail(data.id)
    }
    return response.code === 200
  }

  const removeProblemSet = async (id: string): Promise<boolean> => {
    const response = await deleteProblemSet(id)
    if (response.code === 200) {
      problemSets.value = problemSets.value.filter((item) => item.id !== id)
      if (currentProblemSet.value?.id === id) {
        currentProblemSet.value = null
      }
      return true
    }
    return false
  }

  const replaceProblems = async (
    id: string,
    problems: ProblemSetProblemDTO[]
  ): Promise<boolean> => {
    const response = await replaceProblemSetProblems(id, problems)
    if (response.code === 200) {
      await fetchProblemSetDetail(id)
      return true
    }
    return false
  }

  const appendProblems = async (
    id: string,
    problems: ProblemSetProblemDTO[]
  ): Promise<boolean> => {
    const response = await appendProblemSetProblems(id, problems)
    if (response.code === 200) {
      await fetchProblemSetDetail(id)
      return true
    }
    return false
  }

  const removeProblem = async (id: string, problemId: string): Promise<boolean> => {
    const response = await removeProblemSetProblem(id, problemId)
    if (response.code === 200) {
      await fetchProblemSetDetail(id)
      return true
    }
    return false
  }

  return {
    problemSets,
    currentProblemSet,
    total,
    loading,
    detailLoading,
    fetchProblemSets,
    fetchProblemSetDetail,
    addProblemSet,
    editProblemSet,
    removeProblemSet,
    replaceProblems,
    appendProblems,
    removeProblem
  }
})
