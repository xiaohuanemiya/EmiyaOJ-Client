<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSubmissionStore } from '@/stores'
import { SubmissionStatusText } from '@/types'

const route = useRoute()
const router = useRouter()
const submissionStore = useSubmissionStore()

// Get problemId from query params
const problemIdFilter = computed(() => {
  const id = route.query.problemId
  return id ? Number(id) : undefined
})

const userIdFilter = ref<number | undefined>(undefined)

// Computed
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

// Methods
const viewSubmission = (id: number) => {
  router.push(`/submission/${id}`)
}

const viewProblem = (id: number) => {
  router.push(`/problem/${id}`)
}

const handlePageChange = (page: number) => {
  submissionStore.setPage(page)
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

const goBack = () => {
  router.back()
}

// Lifecycle
onMounted(() => {
  submissionStore.setFilters({
    problemId: problemIdFilter.value,
    userId: userIdFilter.value,
  })
})

// Watch for route changes
watch(
  () => route.query.problemId,
  (newProblemId) => {
    submissionStore.setFilters({
      problemId: newProblemId ? Number(newProblemId) : undefined,
      userId: userIdFilter.value,
    })
  }
)
</script>

<template>
  <div class="submission-list">
    <div class="header">
      <h1>提交记录</h1>
      <button v-if="problemIdFilter" class="btn btn-back" @click="goBack">
        ← 返回
      </button>
    </div>

    <!-- Filter Info -->
    <div v-if="problemIdFilter" class="filter-info">
      筛选: 题目 #{{ problemIdFilter }}
      <button class="btn-clear" @click="router.push('/submissions')">
        清除筛选
      </button>
    </div>

    <!-- Loading -->
    <div v-if="submissionStore.loading" class="loading">加载中...</div>

    <!-- Submission Table -->
    <div v-else class="table-container">
      <table class="submission-table">
        <thead>
          <tr>
            <th>提交ID</th>
            <th>题目</th>
            <th>用户</th>
            <th>语言</th>
            <th>状态</th>
            <th>运行时间</th>
            <th>内存</th>
            <th>提交时间</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="submission in submissionStore.submissions"
            :key="submission.id"
            class="submission-row"
            @click="viewSubmission(submission.id)"
          >
            <td>{{ submission.id }}</td>
            <td class="problem-link" @click.stop="viewProblem(submission.problemId)">
              {{ submission.problemId }}. {{ submission.problemTitle }}
            </td>
            <td>{{ submission.username }}</td>
            <td>{{ submission.language }}</td>
            <td>
              <span :class="['status-badge', statusClass(submission.status)]">
                {{ SubmissionStatusText[submission.status] }}
              </span>
            </td>
            <td>{{ submission.time }}ms</td>
            <td>{{ submission.memory }}KB</td>
            <td>{{ formatTime(submission.createTime) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="submissionStore.submissions.length === 0" class="empty-state">
        暂无提交记录
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="submissionStore.pagination.pages > 1" class="pagination">
      <button
        class="btn btn-page"
        :disabled="!submissionStore.hasPrevPage"
        @click="handlePageChange(submissionStore.pagination.current - 1)"
      >
        上一页
      </button>
      <span class="page-info">
        第 {{ submissionStore.pagination.current }} / {{ submissionStore.pagination.pages }} 页
        (共 {{ submissionStore.pagination.total }} 条)
      </span>
      <button
        class="btn btn-page"
        :disabled="!submissionStore.hasNextPage"
        @click="handlePageChange(submissionStore.pagination.current + 1)"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<style scoped>
.submission-list {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

h1 {
  color: var(--color-heading);
}

.btn-back {
  background: none;
  border: none;
  color: #10b981;
  cursor: pointer;
  font-size: 14px;
}

.btn-back:hover {
  text-decoration: underline;
}

.filter-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--color-background-soft);
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
  color: var(--color-text);
}

.btn-clear {
  background: none;
  border: none;
  color: #10b981;
  cursor: pointer;
  font-size: 14px;
}

.btn-clear:hover {
  text-decoration: underline;
}

.loading,
.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--color-text);
}

.table-container {
  overflow-x: auto;
}

.submission-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--color-background);
}

.submission-table th,
.submission-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}

.submission-table th {
  background: var(--color-background-soft);
  font-weight: 600;
  color: var(--color-heading);
}

.submission-row {
  cursor: pointer;
  transition: background 0.2s;
}

.submission-row:hover {
  background: var(--color-background-soft);
}

.problem-link {
  color: #10b981;
  cursor: pointer;
}

.problem-link:hover {
  text-decoration: underline;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-judging {
  background: #dbeafe;
  color: #2563eb;
}

.status-accepted {
  background: #d1fae5;
  color: #059669;
}

.status-error {
  background: #fee2e2;
  color: #dc2626;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
}

.btn {
  padding: 8px 16px;
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

.btn-page {
  background: var(--color-background-soft);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.page-info {
  color: var(--color-text);
  font-size: 14px;
}
</style>
