<!-- src/views/ProblemList/index.vue -->
<template>
  <div class="problem-list-container">
    <el-card>
      <template #header>
        <div class="header-content">
          <h2>题目列表</h2>
          <el-input
            v-model="queryParams.keyword"
            placeholder="搜索题目..."
            style="width: 300px"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button :icon="Search" @click="handleSearch" />
            </template>
          </el-input>
        </div>
      </template>

      <!-- 筛选条件 -->
      <div class="filter-bar">
        <el-space wrap>
          <span>难度：</span>
          <el-radio-group v-model="queryParams.difficulty" @change="handleSearch">
            <el-radio-button :value="undefined">全部</el-radio-button>
            <el-radio-button :value="0">简单</el-radio-button>
            <el-radio-button :value="1">中等</el-radio-button>
            <el-radio-button :value="2">困难</el-radio-button>
          </el-radio-group>
        </el-space>
      </div>

      <!-- 题目表格 -->
      <el-table
        v-loading="problemStore.loading"
        :data="problemStore.problems"
        style="width: 100%; margin-top: 20px"
        @row-click="handleRowClick"
      >
        <el-table-column prop="id" label="题号" width="100" />
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column label="难度" width="100">
          <template #default="{ row }">
            <el-tag
              :type="getDifficultyType(row.difficulty)"
              size="small"
            >
              {{ getDifficultyText(row.difficulty) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="通过率" width="120">
          <template #default="{ row }">
            {{ formatPassRate(row.passRate) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.userStatus === 2" type="success" size="small">
              已通过
            </el-tag>
            <el-tag v-else-if="row.userStatus === 1" type="warning" size="small">
              尝试过
            </el-tag>
            <el-tag v-else type="info" size="small">
              未尝试
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="标签" min-width="200">
          <template #default="{ row }">
            <el-tag
              v-for="tag in row.tags"
              :key="tag"
              size="small"
              style="margin-right: 5px"
            >
              {{ tag }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.current"
          v-model:page-size="queryParams.size"
          :total="problemStore.total"
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
import { Search } from '@element-plus/icons-vue'
import { useProblemStore } from '@/stores/problem'
import type { ProblemQueryParams } from '@/types/problem'

const router = useRouter()
const problemStore = useProblemStore()

const queryParams = reactive<ProblemQueryParams>({
  current: 1,
  size: 20,
  difficulty: undefined,
  keyword: ''
})

const handleSearch = () => {
  queryParams.current = 1
  problemStore.fetchProblems(queryParams)
}

const handlePageChange = () => {
  problemStore.fetchProblems(queryParams)
}

const handleSizeChange = () => {
  queryParams.current = 1
  problemStore.fetchProblems(queryParams)
}

const handleRowClick = (row: any) => {
  router.push(`/problem/${row.id}`)
}

const getDifficultyType = (difficulty: number) => {
  const types = ['success', 'warning', 'danger']
  return types[difficulty] || 'info'
}

const getDifficultyText = (difficulty: number) => {
  const texts = ['简单', '中等', '困难']
  return texts[difficulty] || '未知'
}

const formatPassRate = (rate: number) => {
  return `${(rate * 100).toFixed(1)}%`
}

onMounted(() => {
  problemStore.fetchProblems(queryParams)
})
</script>

<style scoped lang="scss">
.problem-list-container {
  padding: 20px;
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    h2 {
      margin: 0;
    }
  }
  
  .filter-bar {
    padding: 15px 0;
    border-bottom: 1px solid #ebeef5;
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
