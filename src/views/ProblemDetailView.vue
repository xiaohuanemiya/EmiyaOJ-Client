<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProblemStore, useSubmissionStore, useLanguageStore } from '@/stores'
import { ProblemDifficultyText, UserProblemStatusText, SubmissionStatusText, SubmissionStatus } from '@/types'

const route = useRoute()
const router = useRouter()
const problemStore = useProblemStore()
const submissionStore = useSubmissionStore()
const languageStore = useLanguageStore()

// State
const code = ref('')
const selectedLanguageId = ref<number | null>(null)
const showSubmissionResult = ref(false)
const lastSubmissionId = ref<number | null>(null)
const validationError = ref('')

// Computed
const problemId = computed(() => Number(route.params.id))
const problem = computed(() => problemStore.currentProblem)
const isSubmitting = computed(() => submissionStore.submitting)
const currentSubmission = computed(() => submissionStore.currentSubmission)
const isPolling = computed(() => submissionStore.isPolling)

const statusClass = computed(() => (status: number) => {
  const classes: Record<number, string> = {
    0: 'status-judging',
    1: 'status-error',
    2: 'status-accepted',
    3: 'status-error',
    4: 'status-error',
    5: 'status-error',
  }
  return classes[status] || ''
})

const difficultyClass = computed(() => {
  if (!problem.value) return ''
  const classes: Record<number, string> = {
    0: 'difficulty-easy',
    1: 'difficulty-medium',
    2: 'difficulty-hard',
  }
  return classes[problem.value.difficulty] || ''
})

const userStatusClass = computed(() => {
  if (!problem.value) return ''
  const classes: Record<number, string> = {
    0: 'status-not-attempted',
    1: 'status-attempted',
    2: 'status-passed',
  }
  return classes[problem.value.userStatus] || ''
})

// Methods
const handleSubmit = async () => {
  validationError.value = ''
  
  if (!code.value.trim()) {
    validationError.value = '请输入代码'
    return
  }
  if (!selectedLanguageId.value) {
    validationError.value = '请选择编程语言'
    return
  }

  const submissionId = await submissionStore.submit({
    problemId: problemId.value,
    languageId: selectedLanguageId.value,
    code: code.value,
  })

  if (submissionId) {
    lastSubmissionId.value = submissionId
    showSubmissionResult.value = true
  }
}

const viewSubmissionDetail = () => {
  if (lastSubmissionId.value) {
    router.push(`/submission/${lastSubmissionId.value}`)
  }
}

const viewAllSubmissions = () => {
  router.push(`/submissions?problemId=${problemId.value}`)
}

const goBack = () => {
  router.push('/problems')
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    problemStore.fetchProblemDetail(problemId.value),
    languageStore.fetchLanguages(),
  ])
  
  // Set default language if available
  if (languageStore.languages.length > 0 && !selectedLanguageId.value) {
    const firstLanguage = languageStore.languages[0]
    if (firstLanguage) {
      selectedLanguageId.value = firstLanguage.id
    }
  }
})

onUnmounted(() => {
  submissionStore.stopPolling()
  problemStore.clearCurrentProblem()
})

// Watch for problem ID changes
watch(problemId, (newId) => {
  if (newId) {
    problemStore.fetchProblemDetail(newId)
    showSubmissionResult.value = false
    lastSubmissionId.value = null
  }
})
</script>

<template>
  <div class="problem-detail">
    <!-- Back button -->
    <button class="btn btn-back" @click="goBack">← 返回题目列表</button>

    <!-- Loading -->
    <div v-if="problemStore.loading && !problem" class="loading">加载中...</div>

    <!-- Problem Content -->
    <div v-else-if="problem" class="problem-content">
      <!-- Header -->
      <div class="problem-header">
        <h1>{{ problem.id }}. {{ problem.title }}</h1>
        <div class="problem-meta">
          <span :class="['badge', difficultyClass]">
            {{ ProblemDifficultyText[problem.difficulty] }}
          </span>
          <span :class="['badge', userStatusClass]">
            {{ UserProblemStatusText[problem.userStatus] }}
          </span>
          <span class="meta-item">通过率: {{ (problem.passRate * 100).toFixed(1) }}%</span>
          <span class="meta-item">时间限制: {{ problem.timeLimit }}ms</span>
          <span class="meta-item">内存限制: {{ problem.memoryLimit }}MB</span>
        </div>
        <div class="tags">
          <span v-for="tag in problem.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </div>

      <div class="problem-body">
        <!-- Left: Problem Description -->
        <div class="problem-description">
          <section>
            <h3>题目描述</h3>
            <p>{{ problem.description }}</p>
          </section>

          <section>
            <h3>输入格式</h3>
            <p>{{ problem.inputFormat }}</p>
          </section>

          <section>
            <h3>输出格式</h3>
            <p>{{ problem.outputFormat }}</p>
          </section>

          <section v-if="problem.examples && problem.examples.length > 0">
            <h3>样例</h3>
            <div
              v-for="(example, index) in problem.examples"
              :key="index"
              class="example"
            >
              <div class="example-item">
                <h4>输入 #{{ index + 1 }}</h4>
                <pre>{{ example.input }}</pre>
              </div>
              <div class="example-item">
                <h4>输出 #{{ index + 1 }}</h4>
                <pre>{{ example.output }}</pre>
              </div>
            </div>
          </section>
        </div>

        <!-- Right: Code Editor -->
        <div class="code-editor">
          <div class="editor-header">
            <h3>代码提交</h3>
            <div class="language-selector">
              <label>编程语言:</label>
              <select v-model="selectedLanguageId">
                <option
                  v-for="lang in languageStore.languages"
                  :key="lang.id"
                  :value="lang.id"
                >
                  {{ lang.name }} ({{ lang.description }})
                </option>
              </select>
            </div>
          </div>

          <textarea
            v-model="code"
            class="code-textarea"
            placeholder="在此输入你的代码..."
            spellcheck="false"
          ></textarea>

          <!-- Validation Error -->
          <div v-if="validationError" class="validation-error">
            {{ validationError }}
          </div>

          <div class="editor-actions">
            <button
              class="btn btn-submit"
              :disabled="isSubmitting"
              @click="handleSubmit"
            >
              {{ isSubmitting ? '提交中...' : '提交代码' }}
            </button>
            <button class="btn btn-secondary" @click="viewAllSubmissions">
              查看提交记录
            </button>
          </div>

          <!-- Submission Result Panel -->
          <div v-if="showSubmissionResult && currentSubmission" class="submission-result">
            <h4>提交结果</h4>
            <div class="result-content">
              <div class="result-item">
                <span class="label">状态:</span>
                <span :class="['result-status', statusClass(currentSubmission.status)]">
                  {{ SubmissionStatusText[currentSubmission.status] }}
                  <span v-if="isPolling" class="polling-indicator">⏳</span>
                </span>
              </div>
              <div v-if="currentSubmission.status !== SubmissionStatus.JUDGING" class="result-item">
                <span class="label">运行时间:</span>
                <span>{{ currentSubmission.time }}ms</span>
              </div>
              <div v-if="currentSubmission.status !== SubmissionStatus.JUDGING" class="result-item">
                <span class="label">内存:</span>
                <span>{{ currentSubmission.memory }}KB</span>
              </div>
              <button class="btn btn-link" @click="viewSubmissionDetail">
                查看详情 →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else class="not-found">
      题目不存在
    </div>
  </div>
</template>

<style scoped>
.problem-detail {
  padding: 20px;
  max-width: 1400px;
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

.problem-header {
  margin-bottom: 24px;
}

.problem-header h1 {
  margin-bottom: 12px;
  color: var(--color-heading);
  font-size: 24px;
}

.problem-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

.badge {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.meta-item {
  font-size: 14px;
  color: var(--color-text);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 4px 12px;
  background: var(--color-background-mute);
  border-radius: 16px;
  font-size: 12px;
  color: var(--color-text);
}

.problem-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

@media (max-width: 1024px) {
  .problem-body {
    grid-template-columns: 1fr;
  }
}

.problem-description {
  background: var(--color-background-soft);
  padding: 20px;
  border-radius: 8px;
}

.problem-description section {
  margin-bottom: 20px;
}

.problem-description section:last-child {
  margin-bottom: 0;
}

.problem-description h3 {
  margin-bottom: 8px;
  color: var(--color-heading);
  font-size: 16px;
  font-weight: 600;
}

.problem-description p {
  line-height: 1.6;
  white-space: pre-wrap;
}

.example {
  margin-bottom: 16px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  overflow: hidden;
}

.example-item {
  padding: 12px;
}

.example-item:first-child {
  border-bottom: 1px solid var(--color-border);
}

.example-item h4 {
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-heading);
}

.example-item pre {
  background: var(--color-background);
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  font-family: monospace;
  font-size: 14px;
}

.code-editor {
  background: var(--color-background-soft);
  padding: 20px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 12px;
}

.editor-header h3 {
  color: var(--color-heading);
  font-size: 16px;
  font-weight: 600;
}

.language-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.language-selector label {
  font-size: 14px;
  color: var(--color-text);
}

.language-selector select {
  padding: 6px 12px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background);
  color: var(--color-text);
  font-size: 14px;
}

.code-textarea {
  flex: 1;
  min-height: 300px;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background);
  color: var(--color-text);
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
}

.code-textarea::placeholder {
  color: var(--color-text);
  opacity: 0.5;
}

.validation-error {
  margin-top: 8px;
  padding: 8px 12px;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 4px;
  font-size: 14px;
}

.editor-actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: opacity 0.2s;
}

.btn:hover {
  opacity: 0.8;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-submit {
  background: #10b981;
  color: white;
}

.btn-secondary {
  background: var(--color-background-mute);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-link {
  background: none;
  color: #10b981;
  padding: 4px 0;
}

.submission-result {
  margin-top: 16px;
  padding: 16px;
  background: var(--color-background);
  border-radius: 4px;
  border: 1px solid var(--color-border);
}

.submission-result h4 {
  margin-bottom: 12px;
  color: var(--color-heading);
  font-weight: 600;
}

.result-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result-item {
  display: flex;
  gap: 8px;
}

.result-item .label {
  color: var(--color-text);
  opacity: 0.8;
}

.result-status {
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

.polling-indicator {
  display: inline-block;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Badge colors */
.difficulty-easy {
  background: #d1fae5;
  color: #059669;
}

.difficulty-medium {
  background: #fef3c7;
  color: #d97706;
}

.difficulty-hard {
  background: #fee2e2;
  color: #dc2626;
}

.status-not-attempted {
  background: #e5e7eb;
  color: #6b7280;
}

.status-attempted {
  background: #fef3c7;
  color: #d97706;
}

.status-passed {
  background: #d1fae5;
  color: #059669;
}
</style>
