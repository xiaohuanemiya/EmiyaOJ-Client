<template>
  <div class="problem-set-detail-container">
    <el-card v-loading="problemSetStore.detailLoading">
      <template #header>
        <div class="header-content">
          <div>
            <h2>{{ problemSet?.title || '题单详情' }}</h2>
            <div class="meta-line">
              <el-tag :type="problemSet?.status === 1 ? 'success' : 'info'" size="small">
                {{ problemSet?.status === 1 ? '公开' : '隐藏' }}
              </el-tag>
              <span>{{ problemSet?.problemCount ?? problemSetProblems.length }} 道题</span>
              <span>创建者 {{ problemSet?.creatorId || '-' }}</span>
            </div>
          </div>
          <div v-if="isOwner" class="header-actions">
            <el-button @click="router.push(`/problem-set/${problemSetId}/edit`)">编辑</el-button>
            <el-button type="danger" @click="handleDelete">删除</el-button>
          </div>
        </div>
      </template>

      <div class="section">
        <h3>题单说明</h3>
        <markdown-viewer :content="problemSet?.description || '暂无说明'" />
      </div>

      <div class="section">
        <h3>题目列表</h3>
        <el-table :data="problemSetProblems" border style="width: 100%" @row-click="handleProblemClick">
          <el-table-column prop="sortOrder" label="#" width="80" />
          <el-table-column label="题目" min-width="220">
            <template #default="{ row }">
              {{ row.problem?.title || `题目 ${row.problemId}` }}
            </template>
          </el-table-column>
          <el-table-column label="难度" width="100">
            <template #default="{ row }">
              <el-tag v-if="row.problem" :type="getDifficultyType(row.problem.difficulty)" size="small">
                {{ getDifficultyText(row.problem.difficulty) }}
              </el-tag>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="note" label="备注" min-width="220">
            <template #default="{ row }">{{ row.note || '-' }}</template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { useProblemSetStore } from '@/stores/problemSet'
import MarkdownViewer from '@/components/MarkdownViewer/index.vue'
import type { ProblemSetProblemVO } from '@/types/problemSet'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const problemSetStore = useProblemSetStore()
const problemSetId = route.params.id as string

const problemSet = computed(() => problemSetStore.currentProblemSet)
const problemSetProblems = computed(() => {
  return [...(problemSet.value?.problems || [])].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
})
const isOwner = computed(() => {
  return !!problemSet.value && String(problemSet.value.creatorId) === String(authStore.user?.id)
})

const getDifficultyType = (difficulty: number) => {
  const types: Record<number, string> = { 1: 'success', 2: 'warning', 3: 'danger' }
  return types[difficulty] || 'info'
}

const getDifficultyText = (difficulty: number) => {
  const texts: Record<number, string> = { 1: '简单', 2: '中等', 3: '困难' }
  return texts[difficulty] || '未知'
}

const handleProblemClick = (row: ProblemSetProblemVO) => {
  router.push(`/problem/${row.problemId}`)
}

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('确认删除这个题单吗？', '删除题单', { type: 'warning' })
    const ok = await problemSetStore.removeProblemSet(problemSetId)
    if (ok) {
      ElMessage.success('题单已删除')
      router.push('/problem-sets')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete problem set failed:', error)
    }
  }
}

onMounted(() => {
  problemSetStore.fetchProblemSetDetail(problemSetId)
})
</script>

<style scoped lang="scss">
.problem-set-detail-container {
  width: 100%;
  padding: 20px;

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;

    h2 {
      margin: 0 0 10px 0;
    }

    .meta-line {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #606266;
    }

    .header-actions {
      display: flex;
      gap: 10px;
      flex-shrink: 0;
    }
  }

  .section {
    margin-top: 24px;

    h3 {
      margin: 0 0 14px 0;
      font-size: 16px;
      color: #303133;
    }
  }

  :deep(.el-table__row) {
    cursor: pointer;
  }
}
</style>
