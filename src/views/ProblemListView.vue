<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { problemAPI } from '@/api/problem'
import type { ProblemVO } from '@/types/api'

const router = useRouter()
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
    const data = await problemAPI.getPage({
      pageNo: pagination.pageNo,
      pageSize: pagination.pageSize,
      difficulty: filterForm.difficulty,
      keyword: filterForm.keyword
    })
    
    problemList.value = data.list
    pagination.total = data.total
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
  const rate = (problem.acceptCount / problem.submitCount * 100).toFixed(1)
  return `${rate}%`
}

/** 跳转到题目详情 */
const goToDetail = (id: number) => {
  router.push(`/problem/${id}`)
}

onMounted(() => {
  getProblemList()
})
</script>

<template>
  <div class="problem-list">
    <div class="page-header">
      <h2>题目列表</h2>
    </div>

    <!-- 筛选条件 -->
    <el-card class="filter-card">
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
    </el-card>

    <!-- 题目列表 -->
    <el-card class="table-card">
      <el-table 
        v-loading="loading" 
        :data="problemList" 
        stripe 
        style="width: 100%"
      >
        <el-table-column prop="id" label="题号" width="80" />
        <el-table-column prop="title" label="标题" min-width="200">
          <template #default="{ row }">
            <a class="problem-title" @click="goToDetail(row.id)">
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
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="goToDetail(row.id)">
              查看
            </el-button>
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
        @size-change="getProblemList"
        @current-change="getProblemList"
      />
    </el-card>
  </div>
</template>

<style scoped>
.problem-list {
  padding: 20px;
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

.problem-title {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
}

.problem-title:hover {
  text-decoration: underline;
}

.el-pagination {
  margin-top: 20px;
  justify-content: center;
}
</style>
