<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { submissionAPI } from '@/api/submission'
import type { SubmissionVO, SubmissionStatus } from '@/types/api'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

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
      problemId: filterForm.problemId,
      userId: userStore.userInfo?.id ? Number(userStore.userInfo.id) : undefined
    })

    submissionList.value = res.data.list
    pagination.total = res.data.total
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
  if (status === 'Wrong Answer') return 'warning'
  return 'danger'
}

/** 返回题目列表 */
const goBack = () => {
  router.push('/problems')
}

/** 跳转到题目详情 */
const goToProblem = (id: number) => {
  router.push(`/problem/${id}`)
}

onMounted(() => {
  getSubmissionList()
})
</script>

<template>
  <div class="submission-list-page">
    <div class="header">
      <el-button @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回题目列表
      </el-button>
      <h2>我的提交记录</h2>
    </div>

    <div class="content">
      <!-- 筛选条件 -->
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

      <!-- 提交记录列表 -->
      <el-table v-loading="loading" :data="submissionList" stripe style="width: 100%">
        <el-table-column prop="id" label="提交ID" width="100" />
        <el-table-column prop="problemId" label="题目ID" width="100">
          <template #default="{ row }">
            <a href="javascript:void(0)" class="problem-link" @click="goToProblem(row.problemId)">
              {{ row.problemId }}
            </a>
          </template>
        </el-table-column>
        <el-table-column prop="problemTitle" label="题目标题" min-width="200">
          <template #default="{ row }">
            <a href="javascript:void(0)" class="problem-link" @click="goToProblem(row.problemId)">
              {{ row.problemTitle }}
            </a>
          </template>
        </el-table-column>
        <el-table-column prop="languageName" label="语言" width="120" />
        <el-table-column prop="status" label="状态" width="150">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="得分" width="80" />
        <el-table-column prop="timeUsed" label="时间(ms)" width="100" />
        <el-table-column prop="memoryUsed" label="内存(KB)" width="110" />
        <el-table-column prop="passRate" label="通过率" width="100" />
        <el-table-column prop="createTime" label="提交时间" width="180" />
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
    </div>
  </div>
</template>

<style scoped>
.submission-list-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px;
}

.header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filter-form {
  margin-bottom: 20px;
}

.problem-link {
  color: #409eff;
  text-decoration: none;
  cursor: pointer;
}

.problem-link:hover {
  text-decoration: underline;
}

.el-pagination {
  margin-top: 20px;
  justify-content: center;
}
</style>
