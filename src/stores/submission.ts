import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  submitCode,
  getSubmissionPage,
  getSubmissionDetail,
  type SubmissionPageParams,
} from '@/api/submission'
import type {
  SubmissionListItem,
  SubmissionDetail,
  SubmitCodeRequest,
  PageResponse,
} from '@/types'
import { SubmissionStatus } from '@/types'

export const useSubmissionStore = defineStore('submission', () => {
  // State
  const submissions = ref<SubmissionListItem[]>([])
  const currentSubmission = ref<SubmissionDetail | null>(null)
  const loading = ref(false)
  const submitting = ref(false)
  const pagination = ref({
    current: 1,
    size: 10,
    total: 0,
    pages: 0,
  })
  const filters = ref({
    problemId: undefined as number | undefined,
    userId: undefined as number | undefined,
  })
  
  // Polling state
  const pollingId = ref<ReturnType<typeof setInterval> | null>(null)
  const pollingSubmissionId = ref<number | null>(null)

  // Getters
  const hasPrevPage = computed(() => pagination.value.current > 1)
  const hasNextPage = computed(() => pagination.value.current < pagination.value.pages)
  const isPolling = computed(() => pollingId.value !== null)

  // Actions
  const fetchSubmissions = async (params?: Partial<SubmissionPageParams>) => {
    loading.value = true
    try {
      const response = await getSubmissionPage({
        current: params?.current ?? pagination.value.current,
        size: params?.size ?? pagination.value.size,
        problemId: params?.problemId ?? filters.value.problemId,
        userId: params?.userId ?? filters.value.userId,
      })
      const data = response.data as PageResponse<SubmissionListItem>
      submissions.value = data.records
      pagination.value = {
        current: data.current,
        size: data.size,
        total: data.total,
        pages: data.pages,
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchSubmissionDetail = async (id: number) => {
    loading.value = true
    try {
      const response = await getSubmissionDetail(id)
      currentSubmission.value = response.data
      return response.data
    } catch (error) {
      console.error('Failed to fetch submission detail:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  const submit = async (data: SubmitCodeRequest) => {
    submitting.value = true
    try {
      const response = await submitCode(data)
      const submissionId = response.data as number
      // Start polling for this submission
      startPolling(submissionId)
      return submissionId
    } catch (error) {
      console.error('Failed to submit code:', error)
      return null
    } finally {
      submitting.value = false
    }
  }

  // Polling mechanism for submission status
  const startPolling = (submissionId: number) => {
    // Clear any existing polling
    stopPolling()
    
    pollingSubmissionId.value = submissionId
    
    // Poll every 2 seconds
    pollingId.value = setInterval(async () => {
      try {
        const response = await getSubmissionDetail(submissionId)
        const submission = response.data
        
        // Update current submission if it's the one being polled
        if (pollingSubmissionId.value === submissionId) {
          currentSubmission.value = submission
        }
        
        // Update the submission in the list if it exists
        const index = submissions.value.findIndex((s) => s.id === submissionId)
        if (index !== -1) {
          const existingSubmission = submissions.value[index]
          if (existingSubmission) {
            submissions.value[index] = {
              ...existingSubmission,
              status: submission.status,
              time: submission.time,
              memory: submission.memory,
            }
          }
        }
        
        // Stop polling if judging is complete (status !== 0)
        if (submission.status !== SubmissionStatus.JUDGING) {
          stopPolling()
        }
      } catch (error) {
        console.error('Polling error:', error)
        stopPolling()
      }
    }, 2000)
  }

  const stopPolling = () => {
    if (pollingId.value) {
      clearInterval(pollingId.value)
      pollingId.value = null
      pollingSubmissionId.value = null
    }
  }

  const setPage = (page: number) => {
    pagination.value.current = page
    fetchSubmissions()
  }

  const setFilters = (newFilters: typeof filters.value) => {
    filters.value = newFilters
    pagination.value.current = 1
    fetchSubmissions()
  }

  const clearCurrentSubmission = () => {
    currentSubmission.value = null
    stopPolling()
  }

  return {
    // State
    submissions,
    currentSubmission,
    loading,
    submitting,
    pagination,
    filters,
    // Getters
    hasPrevPage,
    hasNextPage,
    isPolling,
    // Actions
    fetchSubmissions,
    fetchSubmissionDetail,
    submit,
    startPolling,
    stopPolling,
    setPage,
    setFilters,
    clearCurrentSubmission,
  }
})
