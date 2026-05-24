<template>
  <div class="problem-set-list-container">
    <el-card>
      <template #header>
        <div class="header-content">
          <h2>题单列表</h2>
          <div class="header-actions">
            <el-input
              v-model="queryParams.title"
              placeholder="搜索题单标题"
              clearable
              style="width: 260px"
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            >
              <template #append>
                <el-button :icon="Search" @click="handleSearch" />
              </template>
            </el-input>
            <el-button
              :type="isMyFilter ? 'primary' : 'default'"
              :plain="!isMyFilter"
              @click="toggleMyProblemSets"
            >
              我的题单
            </el-button>
            <el-button type="primary" @click="router.push('/problem-set/create')">
              创建题单
            </el-button>
          </div>
        </div>
      </template>

      <div class="filter-bar">
        <el-form :inline="true" :model="queryParams">
          <el-form-item label="状态">
            <el-select
              v-model="queryParams.status"
              placeholder="全部"
              clearable
              style="width: 140px"
              @change="handleSearch"
            >
              <el-option label="隐藏" :value="0" />
              <el-option label="公开" :value="1" />
            </el-select>
          </el-form-item>
          <el-form-item label="创建者ID">
            <el-input
              v-model="queryParams.creatorId"
              placeholder="可选"
              clearable
              style="width: 180px"
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table
        v-loading="problemSetStore.loading"
        :data="problemSetStore.problemSets"
        style="width: 100%"
        @row-click="handleRowClick"
      >
        <el-table-column prop="title" label="标题" min-width="220" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '公开' : '隐藏' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="problemCount" label="题目数" width="100" />
        <el-table-column label="创建者" width="160">
          <template #default="{ row }">{{ formatCreatorName(row) }}</template>
        </el-table-column>
        <el-table-column label="更新时间" width="180">
          <template #default="{ row }">{{ formatDate(row.updateTime || row.createTime) }}</template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :total="problemSetStore.total"
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
import { computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useProblemSetStore } from '@/stores/problemSet'
import type { ProblemSetQueryParams, ProblemSetVO } from '@/types/problemSet'
import { formatDateTime } from '@/utils/format'

const router = useRouter()
const authStore = useAuthStore()
const problemSetStore = useProblemSetStore()

const queryParams = reactive<ProblemSetQueryParams>({
  pageNum: 1,
  pageSize: 20,
  title: '',
  status: undefined,
  creatorId: undefined
})

const isMyFilter = computed(() => {
  return !!queryParams.creatorId && queryParams.creatorId === String(authStore.user?.id)
})

const formatDate = (value?: string) => (value ? formatDateTime(value) : '-')

const formatCreatorName = (problemSet: ProblemSetVO) => {
  const nickname = problemSet.creatorNickname?.trim()
  return nickname || problemSet.creatorId || '-'
}

const toggleMyProblemSets = () => {
  if (isMyFilter.value) {
    // 取消筛选，显示全部
    queryParams.creatorId = undefined
  } else {
    // 筛选当前用户的题单
    queryParams.creatorId = authStore.user?.id ? String(authStore.user.id) : undefined
  }
  handleSearch()
}

const handleSearch = () => {
  queryParams.pageNum = 1
  problemSetStore.fetchProblemSets(queryParams)
}

const handleReset = () => {
  queryParams.title = ''
  queryParams.status = undefined
  queryParams.creatorId = undefined
  handleSearch()
}

const handlePageChange = () => {
  problemSetStore.fetchProblemSets(queryParams)
}

const handleSizeChange = () => {
  queryParams.pageNum = 1
  problemSetStore.fetchProblemSets(queryParams)
}

const handleRowClick = (row: ProblemSetVO) => {
  router.push(`/problem-set/${row.id}`)
}

onMounted(() => {
  problemSetStore.fetchProblemSets(queryParams)
})
</script>

<style scoped lang="scss">
.problem-set-list-container {
  width: 100%;
  padding: 20px;

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;

    h2 {
      margin: 0;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }

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
  }
}
</style>
