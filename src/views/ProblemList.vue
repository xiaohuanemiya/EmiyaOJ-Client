<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { problemAPI } from '@/api/problem'
import type { ProblemVO } from '@/types/api'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const problemList = ref<ProblemVO[]>([])

const pagination = reactive({
  pageNo: 1,
  pageSize: 20,
  total: 0
})

const filterForm = reactive({
  difficulty: undefined as number | undefined,
  keyword: ''
})

/** 获取题目列表 */
const getProblemList = async () => {
  loading.value = true
  try {
    const res = await problemAPI.getPage({
      pageNo: pagination.pageNo,
      pageSize: pagination.pageSize,
      difficulty: filterForm.difficulty,
      keyword: filterForm.keyword
    })

    problemList.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error('获取题目列表失败:', error)
  } finally {
    loading.value = false
  }
}

/** 搜索 */
const handleSearch = () => {
  pagination.pageNo = 1
  getProblemList()
}

/** 重置 */
const handleReset = () => {
  filterForm.difficulty = undefined
  filterForm.keyword = ''
  handleSearch()
}

/** 获取难度类型 */
const getDifficultyType = (difficulty: number) => {
  const typeMap: Record<number, 'success' | 'warning' | 'danger'> = {
    1: 'success',
    2: 'warning',
    3: 'danger'
  }
  return typeMap[difficulty] || 'success'
}

/** 获取难度文本 */
const getDifficultyText = (difficulty: number) => {
  const textMap: Record<number, string> = {
    1: '简单',
    2: '中等',
    3: '困难'
  }
  return textMap[difficulty] || ''
}

/** 计算通过率 */
const getAcceptRate = (problem: ProblemVO) => {
  if (problem.submitCount === 0) return '0%'
  const rate = ((problem.acceptCount / problem.submitCount) * 100).toFixed(1)
  return `${rate}%`
}

/** 跳转到题目详情 */
const goToProblem = (id: number) => {
  router.push(`/problem/${id}`)
}

/** 退出登录 */
const handleLogout = async () => {
  await userStore.logout()
  ElMessage.success('已退出登录')
}

onMounted(() => {
  getProblemList()
})
</script>

<template>
  <div class="problem-list-page">
    <div class="header">
      <h1>EmiyaOJ 在线评测系统</h1>
      <div class="user-info">
        <span>欢迎，{{ userStore.userInfo?.name || userStore.userInfo?.username }}</span>
        <el-button type="primary" link @click="router.push('/submissions')">我的提交</el-button>
        <el-button type="danger" link @click="handleLogout">退出</el-button>
      </div>
    </div>

    <div class="content">
      <!-- 筛选条件 -->
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="难度">
          <el-select v-model="filterForm.difficulty" placeholder="全部难度" clearable>
            <el-option label="简单" :value="1" />
            <el-option label="中等" :value="2" />
            <el-option label="困难" :value="3" />
          </el-select>
        </el-form-item>

        <el-form-item label="搜索">
          <el-input
            v-model="filterForm.keyword"
            placeholder="题目标题"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 题目列表 -->
      <el-table v-loading="loading" :data="problemList" stripe style="width: 100%">
        <el-table-column prop="id" label="题号" width="80" />
        <el-table-column prop="title" label="标题" min-width="200">
          <template #default="{ row }">
            <a href="javascript:void(0)" class="problem-title" @click="goToProblem(row.id)">
              {{ row.title }}
            </a>
          </template>
        </el-table-column>
        <el-table-column prop="difficulty" label="难度" width="100">
          <template #default="{ row }">
            <el-tag :type="getDifficultyType(row.difficulty)">
              {{ getDifficultyText(row.difficulty) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="通过率" width="120">
          <template #default="{ row }">
            {{ getAcceptRate(row) }}
          </template>
        </el-table-column>
        <el-table-column prop="submitCount" label="提交数" width="100" />
        <el-table-column prop="acceptCount" label="通过数" width="100" />
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.pageNo"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="getProblemList"
        @current-change="getProblemList"
      />
    </div>
  </div>
</template>

<style scoped>
.problem-list-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  background: white;
  padding: 20px 40px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.content {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filter-form {
  margin-bottom: 20px;
}

.problem-title {
  color: #409eff;
  text-decoration: none;
  cursor: pointer;
}

.problem-title:hover {
  text-decoration: underline;
}

.el-pagination {
  margin-top: 20px;
  justify-content: center;
}
</style>
