// composables/useSubmissionPolling.ts - 轮询判题结果
import { ref, onUnmounted } from 'vue'
import { submissionAPI } from '@/api/submission'
import { ElMessage } from 'element-plus'
import type { SubmissionVO, SubmissionStatus } from '@/types/api'

/** 终态状态列表 */
const FINAL_STATES: SubmissionStatus[] = [
  'Accepted',
  'Wrong Answer',
  'Time Limit Exceeded',
  'Memory Limit Exceeded',
  'Runtime Error',
  'Compile Error',
  'System Error'
]

export function useSubmissionPolling() {
  const submission = ref<SubmissionVO | null>(null)
  const isPolling = ref(false)
  let pollingTimer: ReturnType<typeof setTimeout> | null = null

  /**
   * 开始轮询提交结果
   * @param submissionId 提交记录 ID
   * @param interval 轮询间隔（毫秒），默认 2000
   * @param maxAttempts 最大轮询次数，默认 60
   */
  const startPolling = async (
    submissionId: number,
    interval = 2000,
    maxAttempts = 60
  ): Promise<SubmissionVO> => {
    return new Promise((resolve, reject) => {
      let attempts = 0
      isPolling.value = true

      const poll = async () => {
        try {
          attempts++
          const res = await submissionAPI.getDetail(submissionId)
          submission.value = res.data.data

          // 检查是否为终态
          if (FINAL_STATES.includes(res.data.data.status)) {
            stopPolling()
            resolve(res.data.data)
            return
          }

          // 检查是否超过最大轮询次数
          if (attempts >= maxAttempts) {
            stopPolling()
            ElMessage.error('判题超时，请稍后查看结果')
            reject(new Error('判题超时'))
            return
          }

          // 继续轮询
          pollingTimer = setTimeout(poll, interval)
        } catch (error) {
          stopPolling()
          reject(error)
        }
      }

      poll()
    })
  }

  /** 停止轮询 */
  const stopPolling = () => {
    if (pollingTimer) {
      clearTimeout(pollingTimer)
      pollingTimer = null
    }
    isPolling.value = false
  }

  // 组件卸载时清除定时器
  onUnmounted(() => {
    stopPolling()
  })

  return {
    submission,
    isPolling,
    startPolling,
    stopPolling
  }
}
