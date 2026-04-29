// src/stores/submission.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Submission, SubmissionDetailVO, SubmitCodeParams, MySubmissionQueryParams } from '@/types/submission'
import { submitCode as submitCodeApi, getMySubmissions, getSubmissionDetail } from '@/api/submission'

export const useSubmissionStore = defineStore('submission', () => {
  // State
  const submissions = ref<Submission[]>([])
  const currentSubmission = ref<SubmissionDetailVO | null>(null)
  const total = ref(0)
  const loading = ref(false)

  // Actions
  const submitCode = async (params: SubmitCodeParams): Promise<Submission | null> => {
    try {
      const response = await submitCodeApi(params)
      if (response.code === 200 && response.data) {
        return response.data
      }
      return null
    } catch (error) {
      console.error('Failed to submit code:', error)
      return null
    }
  }

  const fetchMySubmissions = async (params: MySubmissionQueryParams) => {
    loading.value = true
    try {
      const response = await getMySubmissions(params)
      if (response.code === 200 && response.data) {
        submissions.value = response.data.list
        total.value = response.data.total
      }
    } catch (error) {
      console.error('Failed to fetch my submissions:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchSubmissionDetail = async (id: string) => {
    loading.value = true
    try {
      const response = await getSubmissionDetail(id)
      if (response.code === 200 && response.data) {
        currentSubmission.value = response.data
      }
    } catch (error) {
      console.error('Failed to fetch submission detail:', error)
    } finally {
      loading.value = false
    }
  }

  return {
    submissions,
    currentSubmission,
    total,
    loading,
    submitCode,
    fetchMySubmissions,
    fetchSubmissionDetail
  }
})
