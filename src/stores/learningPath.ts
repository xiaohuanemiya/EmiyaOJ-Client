// src/stores/learningPath.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { LearningPathRecommendation } from '@/types/problem'
import { getRecommendProblems } from '@/api/problem'

/** 无意义的标签关键词（LLM 可能返回的占位标签） */
const MEANINGLESS_TAGS = ['uncategorized', 'undefined', 'null', 'none', '未知', '未分类', 'n/a']

/** 过滤无意义标签 */
const filterMeaninglessTags = (tags: string[]): string[] => {
  return tags.filter(tag => {
    const lower = tag.toLowerCase().trim()
    return lower && !MEANINGLESS_TAGS.includes(lower)
  })
}

export const useLearningPathStore = defineStore('learningPath', () => {
  // State
  const recommendation = ref<LearningPathRecommendation | null>(null)
  const loading = ref(false)
  const error = ref(false)

  // Getters
  const hasValidWeakTags = computed(() => {
    if (!recommendation.value) return false
    return filterMeaninglessTags(recommendation.value.weakTags).length > 0
  })

  const filteredWeakTags = computed(() => {
    if (!recommendation.value) return []
    return filterMeaninglessTags(recommendation.value.weakTags)
  })

  // Actions

  /** 获取个性化推荐，limit 默认 4 */
  const fetchRecommendations = async (limit: number = 4) => {
    loading.value = true
    error.value = false
    try {
      const response = await getRecommendProblems(limit)
      if (response.code === 200 && response.data) {
        // 过滤后端可能返回的无意义标签
        const data = response.data
        data.weakTags = filterMeaninglessTags(data.weakTags)
        // 清理 summary 中的无意义标签文案（包括可能附带的中英文标点）
        for (const tag of MEANINGLESS_TAGS) {
          data.summary = data.summary
            .replace(new RegExp(`[，,]?\\s*${tag}\\s*[。.]?`, 'gi'), '')
            .replace(/\s+/g, ' ')
            .trim()
        }
        // 清理后若 summary 结尾缺少标点则补上
        if (data.summary && !/[。！？.!?]$/.test(data.summary)) {
          data.summary += '。'
        }
        recommendation.value = data
        // 按 priority 升序排列
        if (data.recommendations) {
          data.recommendations.sort((a, b) => a.priority - b.priority)
        }
      } else {
        error.value = true
      }
    } catch (e) {
      console.error('Failed to fetch recommendations:', e)
      error.value = true
    } finally {
      loading.value = false
    }
  }

  /** 清空推荐数据 */
  const clearRecommendations = () => {
    recommendation.value = null
    loading.value = false
    error.value = false
  }

  return {
    recommendation,
    loading,
    error,
    hasValidWeakTags,
    filteredWeakTags,
    fetchRecommendations,
    clearRecommendations
  }
})
