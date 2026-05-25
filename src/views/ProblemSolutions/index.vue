<!-- src/views/ProblemSolutions/index.vue -->
<template>
  <div class="problem-solutions-container">
    <!-- 题目信息卡片 -->
    <el-card class="problem-info-card">
      <div class="problem-info">
        <div class="problem-header">
          <h2>题目 #{{ problemId }}</h2>
          <el-button type="primary" @click="handleWriteSolution">
            <el-icon><Edit /></el-icon>
            写题解
          </el-button>
        </div>
        <div class="problem-actions">
          <el-button text @click="handleBackToProblem">
            <el-icon><ArrowLeft /></el-icon>
            返回题目
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 筛选与排序 -->
    <el-card class="filter-card">
      <el-space wrap>
        <span>排序：</span>
        <el-select
          v-model="queryParams.sortBy"
          placeholder="排序方式"
          clearable
          style="width: 140px"
          @change="handleSearch"
        >
          <el-option label="创建时间" value="createTime" />
          <el-option label="更新时间" value="updateTime" />
          <el-option label="浏览量" value="viewCount" />
          <el-option label="点赞量" value="likeCount" />
        </el-select>
      </el-space>
    </el-card>

    <!-- 题解列表 -->
    <el-card>
      <div v-loading="blogStore.solutionsLoading" class="solution-list">
        <el-empty v-if="blogStore.solutions.length === 0" description="暂无题解" />

        <div
          v-for="solution in blogStore.solutions"
          :key="solution.id"
          class="solution-item"
          @click="handleSolutionClick(solution)"
        >
          <div class="solution-header">
            <h3 class="solution-title">{{ solution.title }}</h3>
          </div>
          <p class="solution-content">{{ truncateContent(solution.content) }}</p>
          <div class="solution-footer">
            <button class="solution-author" type="button" @click.stop="handleAuthorClick(solution.userId)">
              <el-icon><User /></el-icon>
              {{ formatAuthorName(solution) }}
            </button>
            <span class="solution-meta">
              <el-icon><Calendar /></el-icon>
              {{ formatDate(solution.createTime) }}
            </span>
            <span class="solution-stats">
              <span class="stat-item">
                <el-icon><View /></el-icon>
                {{ solution.viewCount }}
              </span>
              <span class="stat-item">
                <el-icon><Star /></el-icon>
                {{ solution.likeCount }}
              </span>
            </span>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="blogStore.solutionsTotal > 0" class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.pageNo"
          v-model:page-size="queryParams.pageSize"
          :total="blogStore.solutionsTotal"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Edit, ArrowLeft, User, Calendar, View, Star } from '@element-plus/icons-vue'
import { useBlogStore } from '@/stores/blog'
import type { Blog, SolutionQueryParams } from '@/types/blog'
import { formatDateTime } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const blogStore = useBlogStore()

const problemId = computed(() => route.params.problemId as string)

const queryParams = reactive<SolutionQueryParams>({
  sortBy: 'createTime',
  pageNo: 1,
  pageSize: 10
})

const handleSearch = () => {
  queryParams.pageNo = 1
  blogStore.fetchSolutions(problemId.value, queryParams)
}

const handlePageChange = () => {
  blogStore.fetchSolutions(problemId.value, queryParams)
}

const handleSizeChange = () => {
  queryParams.pageNo = 1
  blogStore.fetchSolutions(problemId.value, queryParams)
}

const handleWriteSolution = () => {
  router.push(`/blog/create?problemId=${problemId.value}`)
}

const handleBackToProblem = () => {
  router.push(`/problem/${problemId.value}`)
}

const handleSolutionClick = (solution: Blog) => {
  router.push(`/blog/${solution.id}`)
}

const handleAuthorClick = (userId: string) => {
  router.push(`/user/${userId}`)
}

const truncateContent = (content: string) => {
  const maxLength = 200
  if (content.length > maxLength) {
    return content.substring(0, maxLength) + '...'
  }
  return content
}

const formatDate = (dateStr: string) => {
  return formatDateTime(dateStr)
}

const formatAuthorName = (blog: Blog) => {
  const nickname = blog.authorNickname?.trim()
  return nickname || `用户 ${blog.userId}`
}

onMounted(() => {
  blogStore.fetchSolutions(problemId.value, queryParams)
})
</script>

<style scoped>
.problem-solutions-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.problem-info-card {
  margin-bottom: 16px;
}

.problem-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.problem-header h2 {
  margin: 0;
}

.problem-actions {
  margin-top: 8px;
}

.filter-card {
  margin-bottom: 16px;
}

.solution-list {
  min-height: 300px;
}

.solution-item {
  padding: 20px;
  margin-bottom: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.solution-item:last-child {
  margin-bottom: 0;
}

.solution-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.2);
}

.solution-header {
  margin-bottom: 12px;
}

.solution-title {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.solution-content {
  margin: 0 0 12px 0;
  color: #606266;
  line-height: 1.6;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.solution-footer {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  color: #909399;
}

.solution-meta {
  display: flex;
  align-items: center;
  gap: 4px;
}

.solution-author {
  display: flex;
  align-items: center;
  gap: 4px;
  border: 0;
  padding: 0;
  background: transparent;
  color: #909399;
  font: inherit;
  cursor: pointer;
}

.solution-author:hover {
  color: #409eff;
}

.solution-stats {
  display: flex;
  gap: 12px;
  margin-left: auto;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
