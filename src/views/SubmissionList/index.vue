<!-- src/views/SubmissionList/index.vue -->
<template>
  <div class="submission-list-container">
    <el-card>
      <template #header>
        <h2>提交记录</h2>
      </template>

      <!-- 筛选条件 -->
      <div class="filter-bar">
        <el-form :inline="true" :model="queryParams">
          <el-form-item label="题目ID">
            <el-input
              v-model="queryParams.problemId"
              placeholder="输入题目ID"
              clearable
              @clear="handleSearch"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 提交记录表格 -->
      <el-table
        v-loading="submissionStore.loading"
        :data="submissionStore.submissions"
        style="width: 100%"
        @row-click="handleRowClick"
      >
        <el-table-column prop="id" label="提交ID" width="150" />
        <el-table-column prop="problemId" label="题目ID" width="120" />
        <el-table-column label="比赛ID" width="120">
          <template #default="{ row }">
            {{ row.contestId || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="languageId" label="语言ID" width="100" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <status-tag :status="row.status" />
          </template>
        </el-table-column>
        <el-table-column label="时间" width="100">
          <template #default="{ row }">
            {{ row.maxTimeUsed ? `${row.maxTimeUsed}ms` : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="内存" width="100">
          <template #default="{ row }">
            {{ row.maxMemoryUsed ? `${row.maxMemoryUsed}KB` : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="提交时间" width="180" />
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :total="submissionStore.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSubmissionStore } from '@/stores/submission'
import StatusTag from '@/components/StatusTag/index.vue'
import type { MySubmissionQueryParams } from '@/types/submission'

const router = useRouter()
const submissionStore = useSubmissionStore()

const queryParams = reactive<MySubmissionQueryParams>({
  pageNum: 1,
  pageSize: 20,
  problemId: undefined
})

const handleSearch = () => {
  queryParams.pageNum = 1
  submissionStore.fetchMySubmissions(queryParams)
}

const handleReset = () => {
  queryParams.problemId = undefined
  handleSearch()
}

const handlePageChange = () => {
  submissionStore.fetchMySubmissions(queryParams)
}

const handleSizeChange = () => {
  queryParams.pageNum = 1
  submissionStore.fetchMySubmissions(queryParams)
}

const handleRowClick = (row: any) => {
  router.push(`/submission/${row.id}`)
}

onMounted(() => {
  submissionStore.fetchMySubmissions(queryParams)
})
</script>

<style scoped lang="scss">
.submission-list-container {
  width: 100%;
  padding: 20px;

  .filter-bar {
    margin-bottom: 20px;
  }

  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }

  :deep(.el-table__row) {
    cursor: pointer;

    &:hover {
      background-color: #f5f7fa;
    }
  }
}
</style>
