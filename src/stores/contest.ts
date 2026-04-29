import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { PageResult } from '@/types/api'
import type { ContestQueryParams, ContestRankVO, ContestRegisterDTO, ContestVO } from '@/types/contest'
import {
  cancelContestRegistration,
  getContestDetail,
  getContestList,
  getContestRank,
  registerContest
} from '@/api/contest'

const getPageItems = <T>(page: PageResult<T>): T[] => {
  const candidate = page as PageResult<T> & { records?: T[]; rows?: T[] }
  return candidate.list || candidate.records || candidate.rows || []
}

export const useContestStore = defineStore('contest', () => {
  const contests = ref<ContestVO[]>([])
  const currentContest = ref<ContestVO | null>(null)
  const currentRank = ref<ContestRankVO | null>(null)
  const total = ref(0)
  const loading = ref(false)
  const detailLoading = ref(false)
  const rankLoading = ref(false)

  const fetchContests = async (params: ContestQueryParams) => {
    loading.value = true
    try {
      const response = await getContestList(params)
      if (response.code === 200 && response.data) {
        contests.value = getPageItems(response.data)
        total.value = response.data.total || 0
      }
    } catch (error) {
      console.error('Failed to fetch contests:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchContestDetail = async (id: string) => {
    detailLoading.value = true
    try {
      const response = await getContestDetail(id)
      if (response.code === 200 && response.data) {
        currentContest.value = response.data
      }
    } catch (error) {
      console.error('Failed to fetch contest detail:', error)
    } finally {
      detailLoading.value = false
    }
  }

  const register = async (id: string, data: ContestRegisterDTO): Promise<boolean> => {
    const response = await registerContest(id, data)
    if (response.code === 200) {
      await fetchContestDetail(id)
      return true
    }
    return false
  }

  const cancelRegistration = async (id: string): Promise<boolean> => {
    const response = await cancelContestRegistration(id)
    if (response.code === 200) {
      await fetchContestDetail(id)
      return true
    }
    return false
  }

  const fetchContestRank = async (id: string) => {
    rankLoading.value = true
    try {
      const response = await getContestRank(id)
      if (response.code === 200 && response.data) {
        currentRank.value = response.data
      }
    } catch (error) {
      console.error('Failed to fetch contest rank:', error)
    } finally {
      rankLoading.value = false
    }
  }

  return {
    contests,
    currentContest,
    currentRank,
    total,
    loading,
    detailLoading,
    rankLoading,
    fetchContests,
    fetchContestDetail,
    register,
    cancelRegistration,
    fetchContestRank
  }
})
