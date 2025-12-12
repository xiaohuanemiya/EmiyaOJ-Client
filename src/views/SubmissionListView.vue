<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { submissionAPI } from '@/api/submission'
import type { SubmissionVO, SubmissionStatus } from '@/types/api'

const loading = ref(false)
const submissionList = ref<SubmissionVO[]>([])

const pagination = reactive({
  pageNo: 1,
  pageSize: 20,
  total: 0
})

const filterForm = reactive({
  problemId: undefined as number | undefined,
  userId: undefined as number | undefined
})

/** 获取提交记录列表 */
const getSubmissionList = async () => {
  loading.value = true
  try {
    const data = await submissionAPI.getPage({
      pageNo: pagination.pageNo,
      pageSize: pagination.pageSize,
      problemId: filterForm.problemId,
      userId: filterForm.userId
    })
    
    submissionList.value = data.list
    pagination.total = data.total
  } catch (error) {
    console.error('获取提交记录列表失败:', error)
  } finally {
    loading.value = false
  }
}

/** 搜索 */
const handleSearch = () => {
  pagination.pageNo = 1
  getSubmissionList()
}

/** 重置 */
const handleReset = () => {
  filterForm.problemId = undefined
  filterForm.userId = undefined
  handleSearch()
}

/** 获取状态类型 */
const getStatusType = (status: SubmissionStatus) => {
  if (status === 'Accepted') return 'success'
  if (status === 'Pending' || status === 'Running') return 'info'
  return 'danger'
}

/** 格式化时间 */
const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

onMounted(() => {
  getSubmissionList()
})
</script>

<template>
  <div class="submission-list">
    <div class="page-header">
      <h2>提交记录</h2>
    </div>

    <!-- 筛选条件 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="题目ID">
          <el-input 
            v-model.number="filterForm.problemId" 
            placeholder="题目ID" 
            clearable
            type="number"
          />
        </el-form-item>
        
        <el-form-item label="用户ID">
          <el-input 
            v-model.number="filterForm.userId" 
            placeholder="用户ID" 
            clearable
            type="number"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 提交记录列表 -->
    <el-card class="table-card">
      <el-table 
        v-loading="loading" 
        :data="submissionList" 
        stripe 
        style="width: 100%"
      >
        <el-table-column prop="id" label="提交ID" width="100" />
        <el-table-column prop="problemTitle" label="题目" min-width="200" />
        <el-table-column prop="username" label="用户" width="120" />
        <el-table-column prop="languageName" label="语言" width="120" />
        <el-table-column prop="status" label="状态" width="150">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="得分" width="80" />
        <el-table-column label="时间" width="100">
          <template #default="{ row }">
            {{ row.timeUsed }}ms
          </template>
        </el-table-column>
        <el-table-column label="内存" width="100">
          <template #default="{ row }">
            {{ row.memoryUsed }}KB
          </template>
        </el-table-column>
        <el-table-column prop="passRate" label="通过率" width="100" />
        <el-table-column label="提交时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.pageNo"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="getSubmissionList"
        @current-change="getSubmissionList"
      />
    </el-card>
  </div>
</template>

<style scoped>
.submission-list {
  width: 100%;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-form {
  margin: 0;
}

.table-card {
  margin-bottom: 20px;
}

.el-pagination {
  margin-top: 20px;
  justify-content: center;
}
</style>
