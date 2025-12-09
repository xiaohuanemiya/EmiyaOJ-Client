<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { submissionAPI } from '@/api/submission'
import MainLayout from '@/layout/MainLayout.vue'
import type { SubmissionVO, SubmissionStatus } from '@/types/api'

const loading = ref(false)
const submissionList = ref<SubmissionVO[]>([])

const pagination = reactive({
  pageNo: 1,
  pageSize: 20,
  total: 0
})

const filterForm = reactive({
  problemId: undefined as number | undefined
})

/** 获取提交记录列表 */
const getSubmissionList = async () => {
  loading.value = true
  try {
    const res = await submissionAPI.getPage({
      pageNo: pagination.pageNo,
      pageSize: pagination.pageSize,
      problemId: filterForm.problemId
    })
    
    submissionList.value = res.data.data.list
    pagination.total = res.data.data.total
  } catch (error) {
    console.error('获取提交记录失败:', error)
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
  handleSearch()
}

/** 获取状态类型 */
const getStatusType = (status: SubmissionStatus) => {
  if (status === 'Accepted') return 'success'
  if (status === 'Pending' || status === 'Running') return 'info'
  return 'danger'
}

/** 格式化时间 */
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

onMounted(() => {
  getSubmissionList()
})
</script>

<template>
  <MainLayout>
    <div class="submission-list">
      <el-card class="filter-card">
        <el-form :inline="true" :model="filterForm" class="filter-form">
          <el-form-item label="题目ID">
            <el-input 
              v-model.number="filterForm.problemId" 
              placeholder="输入题目ID" 
              clearable
              type="number"
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card class="table-card">
        <el-table 
          v-loading="loading" 
          :data="submissionList" 
          stripe 
          style="width: 100%"
        >
          <el-table-column prop="id" label="提交ID" width="100" />
          <el-table-column label="题目" min-width="150">
            <template #default="{ row }">
              <router-link :to="`/problem/${row.problemId}`" class="problem-link">
                #{{ row.problemId }} {{ row.problemTitle }}
              </router-link>
            </template>
          </el-table-column>
          <el-table-column prop="languageName" label="语言" width="100" />
          <el-table-column label="状态" width="150">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="得分" width="80">
            <template #default="{ row }">
              {{ row.score }}
            </template>
          </el-table-column>
          <el-table-column label="用时" width="100">
            <template #default="{ row }">
              {{ row.timeUsed }}ms
            </template>
          </el-table-column>
          <el-table-column label="内存" width="100">
            <template #default="{ row }">
              {{ row.memoryUsed }}KB
            </template>
          </el-table-column>
          <el-table-column label="通过率" width="100">
            <template #default="{ row }">
              {{ row.passRate }}
            </template>
          </el-table-column>
          <el-table-column label="提交时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.createTime) }}
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container">
          <el-pagination
            v-model:current-page="pagination.pageNo"
            v-model:page-size="pagination.pageSize"
            :total="pagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="getSubmissionList"
            @current-change="getSubmissionList"
          />
        </div>
      </el-card>
    </div>
  </MainLayout>
</template>

<style scoped>
.submission-list {
  max-width: 1400px;
  margin: 0 auto;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-form {
  margin-bottom: 0;
}

.table-card {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.problem-link {
  color: #409eff;
  text-decoration: none;
}

.problem-link:hover {
  text-decoration: underline;
}
</style>
