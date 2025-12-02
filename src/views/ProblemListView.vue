<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProblemStore } from '@/stores'
import { ProblemDifficultyText, UserProblemStatusText } from '@/types'

const router = useRouter()
const problemStore = useProblemStore()

// Filter states
const keywordInput = ref('')
const selectedDifficulty = ref<number | undefined>(undefined)
const selectedStatus = ref<number | undefined>(undefined)

// Computed
const difficultyClass = computed(() => (difficulty: number) => {
  const classes: Record<number, string> = {
    0: 'difficulty-easy',
    1: 'difficulty-medium',
    2: 'difficulty-hard',
  }
  return classes[difficulty] || ''
})

const statusClass = computed(() => (status: number) => {
  const classes: Record<number, string> = {
    0: 'status-not-attempted',
    1: 'status-attempted',
    2: 'status-passed',
  }
  return classes[status] || ''
})

// Methods
const handleSearch = () => {
  problemStore.setFilters({
    keyword: keywordInput.value,
    difficulty: selectedDifficulty.value,
    status: selectedStatus.value,
  })
}

const handleReset = () => {
  keywordInput.value = ''
  selectedDifficulty.value = undefined
  selectedStatus.value = undefined
  problemStore.setFilters({
    keyword: '',
    difficulty: undefined,
    status: undefined,
  })
}

const handlePageChange = (page: number) => {
  problemStore.setPage(page)
}

const viewProblem = (id: number) => {
  router.push(`/problem/${id}`)
}

const formatPassRate = (rate: number) => {
  return (rate * 100).toFixed(1) + '%'
}

onMounted(() => {
  problemStore.fetchProblems()
})
</script>

<template>
  <div class="problem-list">
    <h1>题目列表</h1>

    <!-- Search and Filter -->
    <div class="filter-bar">
      <div class="filter-item">
        <input
          v-model="keywordInput"
          type="text"
          placeholder="搜索题目ID或标题..."
          class="search-input"
          @keyup.enter="handleSearch"
        />
      </div>
      <div class="filter-item">
        <select v-model="selectedDifficulty" class="filter-select">
          <option :value="undefined">全部难度</option>
          <option :value="0">简单</option>
          <option :value="1">中等</option>
          <option :value="2">困难</option>
        </select>
      </div>
      <div class="filter-item">
        <select v-model="selectedStatus" class="filter-select">
          <option :value="undefined">全部状态</option>
          <option :value="0">未尝试</option>
          <option :value="1">尝试过</option>
          <option :value="2">已通过</option>
        </select>
      </div>
      <div class="filter-actions">
        <button class="btn btn-primary" @click="handleSearch">搜索</button>
        <button class="btn btn-secondary" @click="handleReset">重置</button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="problemStore.loading" class="loading">加载中...</div>

    <!-- Problem Table -->
    <div v-else class="table-container">
      <table class="problem-table">
        <thead>
          <tr>
            <th>状态</th>
            <th>题号</th>
            <th>标题</th>
            <th>难度</th>
            <th>通过率</th>
            <th>标签</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="problem in problemStore.problems"
            :key="problem.id"
            class="problem-row"
            @click="viewProblem(problem.id)"
          >
            <td>
              <span :class="['status-badge', statusClass(problem.userStatus)]">
                {{ UserProblemStatusText[problem.userStatus] }}
              </span>
            </td>
            <td>{{ problem.id }}</td>
            <td class="problem-title">{{ problem.title }}</td>
            <td>
              <span :class="['difficulty-badge', difficultyClass(problem.difficulty)]">
                {{ ProblemDifficultyText[problem.difficulty] }}
              </span>
            </td>
            <td>{{ formatPassRate(problem.passRate) }}</td>
            <td>
              <span v-for="tag in problem.tags" :key="tag" class="tag">
                {{ tag }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="problemStore.problems.length === 0" class="empty-state">
        暂无题目
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="problemStore.pagination.pages > 1" class="pagination">
      <button
        class="btn btn-page"
        :disabled="!problemStore.hasPrevPage"
        @click="handlePageChange(problemStore.pagination.current - 1)"
      >
        上一页
      </button>
      <span class="page-info">
        第 {{ problemStore.pagination.current }} / {{ problemStore.pagination.pages }} 页
        (共 {{ problemStore.pagination.total }} 题)
      </span>
      <button
        class="btn btn-page"
        :disabled="!problemStore.hasNextPage"
        @click="handlePageChange(problemStore.pagination.current + 1)"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<style scoped>
.problem-list {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 20px;
  color: var(--color-heading);
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
  align-items: center;
}

.filter-item {
  flex: 1;
  min-width: 150px;
}

.search-input,
.filter-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background);
  color: var(--color-text);
  font-size: 14px;
}

.filter-actions {
  display: flex;
  gap: 8px;
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

.btn-primary {
  background: #10b981;
  color: white;
}

.btn-secondary {
  background: var(--color-background-mute);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-page {
  background: var(--color-background-soft);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.loading {
  text-align: center;
  padding: 40px;
  color: var(--color-text);
}

.table-container {
  overflow-x: auto;
}

.problem-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--color-background);
}

.problem-table th,
.problem-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

.problem-table th {
  background: var(--color-background-soft);
  font-weight: 600;
  color: var(--color-heading);
}

.problem-row {
  cursor: pointer;
  transition: background 0.2s;
}

.problem-row:hover {
  background: var(--color-background-soft);
}

.problem-title {
  color: #10b981;
  font-weight: 500;
}

.status-badge,
.difficulty-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
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

.tag {
  display: inline-block;
  padding: 2px 8px;
  margin: 2px 4px 2px 0;
  background: var(--color-background-mute);
  border-radius: 12px;
  font-size: 12px;
  color: var(--color-text);
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--color-text);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
}

.page-info {
  color: var(--color-text);
  font-size: 14px;
}
</style>
