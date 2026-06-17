<!-- src/views/ProblemList/index.vue -->
<template>
  <div class="problem-list-container">
    <el-card>
      <template #header>
        <div class="header-content">
          <h2>题目列表</h2>
          <el-input
            v-model="queryParams.title"
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
            <el-radio-button :value="1">简单</el-radio-button>
            <el-radio-button :value="2">中等</el-radio-button>
            <el-radio-button :value="3">困难</el-radio-button>
          </el-radio-group>
        </el-space>
      </div>

      <!-- 为你推荐模块（仅登录用户可见） -->
      <div v-if="authStore.isAuthenticated && !lpStore.loading && lpStore.recommendation && lpStore.recommendation.recommendations.length > 0" class="recommend-bar">
        <div class="recommend-bar-header">
          <span class="recommend-bar-title">
            <el-icon><Opportunity /></el-icon>
            为你推荐
          </span>
          <el-tag
            v-if="lpStore.recommendation.source === 'LLM'"
            type="primary"
            effect="dark"
            size="small"
            class="ai-badge-mini"
          >
            <el-icon><Cpu /></el-icon>
            AI
          </el-tag>
        </div>
        <div class="recommend-bar-items">
          <div
            v-for="problem in lpStore.recommendation.recommendations"
            :key="problem.problemId"
            class="recommend-bar-item"
            @click="router.push(`/problem/${problem.problemId}`)"
          >
            <span class="rec-bar-id">#{{ problem.problemId }}</span>
            <span class="rec-bar-title">{{ problem.title }}</span>
            <el-tag
              :type="getDifficultyType(problem.difficulty)"
              size="small"
              effect="dark"
            >
              {{ problem.difficultyDesc }}
            </el-tag>
            <span class="rec-bar-reason">{{ problem.reason }}</span>
          </div>
        </div>
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
            {{ formatPassRate(row) }}
          </template>
        </el-table-column>
        <el-table-column label="标签" min-width="200">
          <template #default="{ row }">
            <el-tag
              v-for="(tag, index) in (row.tags || [])"
              :key="index"
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
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
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
import { Search, Cpu, Opportunity } from '@element-plus/icons-vue'
import { useProblemStore } from '@/stores/problem'
import { useAuthStore } from '@/stores/auth'
import { useLearningPathStore } from '@/stores/learningPath'
import type { ProblemQueryParams } from '@/types/problem'

const router = useRouter()
const problemStore = useProblemStore()
const authStore = useAuthStore()
const lpStore = useLearningPathStore()

const queryParams = reactive<ProblemQueryParams>({
  pageNum: 1,
  pageSize: 20,
  difficulty: undefined,
  title: ''
})

const handleSearch = () => {
  queryParams.pageNum = 1
  problemStore.fetchProblems(queryParams)
}

const handlePageChange = () => {
  problemStore.fetchProblems(queryParams)
}

const handleSizeChange = () => {
  queryParams.pageNum = 1
  problemStore.fetchProblems(queryParams)
}

const handleRowClick = (row: any) => {
  router.push(`/problem/${row.id}`)
}

const getDifficultyType = (difficulty: number) => {
  const types: Record<number, string> = { 1: 'success', 2: 'warning', 3: 'danger' }
  return types[difficulty] || 'info'
}

const getDifficultyText = (difficulty: number) => {
  const texts: Record<number, string> = { 1: '简单', 2: '中等', 3: '困难' }
  return texts[difficulty] || '未知'
}

const formatPassRate = (problem: any) => {
  if (problem.submitCount === 0) {
    return '0.0%'
  }
  const rate = (problem.acceptCount / problem.submitCount) * 100
  return `${rate.toFixed(1)}%`
}

onMounted(() => {
  problemStore.fetchProblems(queryParams)
  if (authStore.isAuthenticated) {
    lpStore.fetchRecommendations(4)
  }
})
</script>

<style scoped lang="scss">
.problem-list-container {
  width: 100%;
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

  // 推荐模块
  .recommend-bar {
    margin-top: 16px;
    padding: 16px 20px;
    background: linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%);
    border: 1px solid #e8e0f0;
    border-radius: 12px;

    .recommend-bar-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;

      .recommend-bar-title {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 15px;
        font-weight: 700;
        color: #4c4f6b;

        .el-icon {
          color: #7c3aed;
        }
      }

      .ai-badge-mini {
        background: linear-gradient(135deg, #667eea, #764ba2);
        border-color: transparent;
        font-weight: 600;
        font-size: 11px;
        height: 22px;
        line-height: 22px;
        padding: 0 8px;
      }
    }

    .recommend-bar-items {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 8px;

      .recommend-bar-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        background: #fff;
        border-radius: 8px;
        cursor: pointer;
        border: 1px solid #f0f0f0;
        transition: all 0.2s ease;
        overflow: hidden;

        &:hover {
          border-color: #c4b5fd;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
        }

        .rec-bar-id {
          font-size: 12px;
          color: #a0aec0;
          font-family: monospace;
          font-weight: 600;
          flex-shrink: 0;
        }

        .rec-bar-title {
          font-size: 14px;
          font-weight: 600;
          color: #1a202c;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
          min-width: 0;
        }

        .rec-bar-reason {
          font-size: 12px;
          color: #a0aec0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 180px;
          flex-shrink: 1;
        }
      }
    }
  }
  
  :deep(.el-table__row) {
    cursor: pointer;
    
    &:hover {
      background-color: #f5f7fa;
    }
  }
}
</style>
