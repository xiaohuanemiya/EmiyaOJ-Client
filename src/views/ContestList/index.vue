<template>
  <div class="contest-list-container">
    <el-card>
      <template #header>
        <div class="header-content">
          <h2>比赛列表</h2>
          <el-input
            v-model="queryParams.title"
            placeholder="搜索比赛标题"
            clearable
            style="width: 280px"
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button :icon="Search" @click="handleSearch" />
            </template>
          </el-input>
        </div>
      </template>

      <div class="filter-bar">
        <el-form :inline="true" :model="queryParams">
          <el-form-item label="规则">
            <el-select
              v-model="queryParams.ruleType"
              placeholder="全部"
              clearable
              style="width: 160px"
              @change="handleSearch"
            >
              <el-option label="ACM/ICPC" :value="1" />
              <el-option label="IOI" :value="2" />
              <el-option label="Codeforces" :value="3" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="queryParams.status"
              placeholder="全部"
              clearable
              style="width: 140px"
              @change="handleSearch"
            >
              <el-option label="草稿" :value="0" />
              <el-option label="已发布" :value="1" />
              <el-option label="已取消" :value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="开始时间">
            <el-date-picker
              v-model="timeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始"
              end-placeholder="结束"
              value-format="YYYY-MM-DDTHH:mm:ss"
              @change="handleTimeRangeChange"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table
        v-loading="contestStore.loading"
        :data="contestStore.contests"
        style="width: 100%"
        @row-click="handleRowClick"
      >
        <el-table-column prop="title" label="标题" min-width="220" />
        <el-table-column label="规则" width="130">
          <template #default="{ row }">
            {{ row.ruleTypeDesc || getRuleText(row.ruleType) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="开始时间" width="180">
          <template #default="{ row }">{{ formatDate(row.startTime) }}</template>
        </el-table-column>
        <el-table-column label="结束时间" width="180">
          <template #default="{ row }">{{ formatDate(row.endTime) }}</template>
        </el-table-column>
        <el-table-column label="报名人数" width="100">
          <template #default="{ row }">{{ row.registrationCount ?? 0 }}</template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :total="contestStore.total"
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
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { useContestStore } from '@/stores/contest'
import type { ContestQueryParams, ContestVO } from '@/types/contest'
import { formatDateTime } from '@/utils/format'

const router = useRouter()
const contestStore = useContestStore()
const timeRange = ref<[string, string] | []>([])

const queryParams = reactive<ContestQueryParams>({
  pageNum: 1,
  pageSize: 20,
  title: '',
  ruleType: undefined,
  status: undefined,
  startFrom: undefined,
  startTo: undefined
})

const getRuleText = (ruleType: number) => {
  const texts: Record<number, string> = { 1: 'ACM/ICPC', 2: 'IOI', 3: 'Codeforces' }
  return texts[ruleType] || '未知'
}

const getStatusText = (status: number) => {
  const texts: Record<number, string> = { 0: '草稿', 1: '已发布', 2: '已取消' }
  return texts[status] || '未知'
}

const getStatusTagType = (status: number) => {
  const types: Record<number, string> = { 0: 'info', 1: 'success', 2: 'danger' }
  return types[status] || 'info'
}

const formatDate = (value?: string) => (value ? formatDateTime(value) : '-')

const handleTimeRangeChange = () => {
  queryParams.startFrom = timeRange.value[0]
  queryParams.startTo = timeRange.value[1]
  handleSearch()
}

const handleSearch = () => {
  queryParams.pageNum = 1
  contestStore.fetchContests(queryParams)
}

const handleReset = () => {
  queryParams.title = ''
  queryParams.ruleType = undefined
  queryParams.status = undefined
  queryParams.startFrom = undefined
  queryParams.startTo = undefined
  timeRange.value = []
  handleSearch()
}

const handlePageChange = () => {
  contestStore.fetchContests(queryParams)
}

const handleSizeChange = () => {
  queryParams.pageNum = 1
  contestStore.fetchContests(queryParams)
}

const handleRowClick = (row: ContestVO) => {
  router.push(`/contest/${row.id}`)
}

onMounted(() => {
  contestStore.fetchContests(queryParams)
})
</script>

<style scoped lang="scss">
.contest-list-container {
  width: 100%;
  padding: 20px;

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;

    h2 {
      margin: 0;
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
