<script setup lang="ts">
import { onMounted, onUnmounted, computed, watch, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSubmissionStore } from '@/stores'
import { SubmissionStatusText, SubmissionStatus } from '@/types'

const route = useRoute()
const router = useRouter()
const submissionStore = useSubmissionStore()

// State
const parsedJudgeInfo = ref<object | null>(null)

// Computed
const submissionId = computed(() => Number(route.params.id))
const submission = computed(() => submissionStore.currentSubmission)
const isPolling = computed(() => submissionStore.isPolling)

const statusClass = computed(() => {
  if (!submission.value) return ''
  const classes: Record<number, string> = {
    0: 'status-judging',
    1: 'status-error',
    2: 'status-accepted',
    3: 'status-error',
    4: 'status-error',
    5: 'status-error',
  }
  return classes[submission.value.status] || ''
})

// Methods
const viewProblem = () => {
  if (submission.value) {
    router.push(`/problem/${submission.value.problemId}`)
  }
}

const goBack = () => {
  router.back()
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

const parseJudgeInfo = () => {
  if (submission.value?.judgeInfo) {
    try {
      parsedJudgeInfo.value = JSON.parse(submission.value.judgeInfo)
    } catch (e) {
      parsedJudgeInfo.value = null
    }
  }
}

// Lifecycle
onMounted(async () => {
  const result = await submissionStore.fetchSubmissionDetail(submissionId.value)
  if (result && result.status === SubmissionStatus.JUDGING) {
    submissionStore.startPolling(submissionId.value)
  }
  parseJudgeInfo()
})

onUnmounted(() => {
  submissionStore.stopPolling()
  submissionStore.clearCurrentSubmission()
})

// Watch for submission changes
watch(submissionId, (newId) => {
  if (newId) {
    submissionStore.fetchSubmissionDetail(newId)
  }
})

// Watch for judge info changes
watch(
  () => submission.value?.judgeInfo,
  () => {
    parseJudgeInfo()
  }
)
</script>

<template>
  <div class="submission-detail">
    <!-- Back button -->
    <button class="btn btn-back" @click="goBack">← 返回</button>

    <!-- Loading -->
    <div v-if="submissionStore.loading && !submission" class="loading">
      加载中...
    </div>

    <!-- Submission Content -->
    <div v-else-if="submission" class="submission-content">
      <!-- Header -->
      <div class="submission-header">
        <h1>提交详情 #{{ submission.id }}</h1>
        <span v-if="isPolling" class="polling-badge">
          ⏳ 判题中...
        </span>
      </div>

      <!-- Info Grid -->
      <div class="info-grid">
        <div class="info-card">
          <h3>基本信息</h3>
          <div class="info-item">
            <span class="label">题目:</span>
            <span class="value link" @click="viewProblem">
              {{ submission.problemId }}. {{ submission.problemTitle }}
            </span>
          </div>
          <div class="info-item">
            <span class="label">用户:</span>
            <span class="value">{{ submission.username }}</span>
          </div>
          <div class="info-item">
            <span class="label">语言:</span>
            <span class="value">{{ submission.language }}</span>
          </div>
          <div class="info-item">
            <span class="label">提交时间:</span>
            <span class="value">{{ formatTime(submission.createTime) }}</span>
          </div>
        </div>

        <div class="info-card">
          <h3>判题结果</h3>
          <div class="info-item">
            <span class="label">状态:</span>
            <span :class="['value', 'status-text', statusClass]">
              {{ SubmissionStatusText[submission.status] }}
            </span>
          </div>
          <div v-if="submission.status !== SubmissionStatus.JUDGING" class="info-item">
            <span class="label">运行时间:</span>
            <span class="value">{{ submission.time }}ms</span>
          </div>
          <div v-if="submission.status !== SubmissionStatus.JUDGING" class="info-item">
            <span class="label">内存:</span>
            <span class="value">{{ submission.memory }}KB</span>
          </div>
        </div>
      </div>

      <!-- Judge Info -->
      <div v-if="parsedJudgeInfo" class="judge-info">
        <h3>判题信息</h3>
        <pre>{{ JSON.stringify(parsedJudgeInfo, null, 2) }}</pre>
      </div>

      <!-- Code -->
      <div class="code-section">
        <h3>提交代码</h3>
        <pre class="code-block"><code>{{ submission.code }}</code></pre>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else class="not-found">
      提交记录不存在
    </div>
  </div>
</template>

<style scoped>
.submission-detail {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.btn-back {
  background: none;
  border: none;
  color: #10b981;
  cursor: pointer;
  font-size: 14px;
  padding: 8px 0;
  margin-bottom: 16px;
}

.btn-back:hover {
  text-decoration: underline;
}

.loading,
.not-found {
  text-align: center;
  padding: 40px;
  color: var(--color-text);
}

.submission-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.submission-header h1 {
  color: var(--color-heading);
  font-size: 24px;
}

.polling-badge {
  padding: 4px 12px;
  background: #dbeafe;
  color: #2563eb;
  border-radius: 4px;
  font-size: 14px;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.info-card {
  background: var(--color-background-soft);
  padding: 20px;
  border-radius: 8px;
}

.info-card h3 {
  margin-bottom: 16px;
  color: var(--color-heading);
  font-size: 16px;
  font-weight: 600;
}

.info-item {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item .label {
  color: var(--color-text);
  opacity: 0.7;
  min-width: 80px;
}

.info-item .value {
  color: var(--color-text);
}

.info-item .link {
  color: #10b981;
  cursor: pointer;
}

.info-item .link:hover {
  text-decoration: underline;
}

.status-text {
  font-weight: 600;
}

.status-judging {
  color: #2563eb;
}

.status-accepted {
  color: #059669;
}

.status-error {
  color: #dc2626;
}

.judge-info {
  background: var(--color-background-soft);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.judge-info h3 {
  margin-bottom: 12px;
  color: var(--color-heading);
  font-size: 16px;
  font-weight: 600;
}

.judge-info pre {
  background: var(--color-background);
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  font-family: monospace;
  font-size: 14px;
}

.code-section {
  background: var(--color-background-soft);
  padding: 20px;
  border-radius: 8px;
}

.code-section h3 {
  margin-bottom: 12px;
  color: var(--color-heading);
  font-size: 16px;
  font-weight: 600;
}

.code-block {
  background: var(--color-background);
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  line-height: 1.5;
}

.code-block code {
  white-space: pre;
}
</style>
