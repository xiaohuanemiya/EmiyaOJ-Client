<template>
  <div class="contest-detail-container">
    <el-card v-loading="contestStore.detailLoading">
      <template #header>
        <div class="header-content">
          <div>
            <h2>{{ contest?.title || '比赛详情' }}</h2>
            <div class="meta-line">
              <el-tag :type="getStatusTagType(contest?.status)" size="small">
                {{ getStatusText(contest?.status) }}
              </el-tag>
              <span>{{ contest?.ruleTypeDesc || getRuleText(contest?.ruleType) }}</span>
              <span>报名 {{ contest?.registrationCount ?? 0 }} 人</span>
            </div>
          </div>
          <div class="header-actions">
            <el-button
              v-if="contest?.registered"
              :disabled="!canCancelRegistration"
              @click="handleCancelRegistration"
            >
              取消报名
            </el-button>
            <el-button
              v-else-if="canRegister"
              type="primary"
              @click="registerDialogVisible = true"
            >
              报名比赛
            </el-button>
            <el-button v-else disabled>
              报名已截止
            </el-button>
          </div>
        </div>
      </template>

      <el-tabs v-if="canViewContestDetail" v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="详情" name="detail">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="开始时间">{{ formatDate(contest?.startTime) }}</el-descriptions-item>
            <el-descriptions-item label="结束时间">{{ formatDate(contest?.endTime) }}</el-descriptions-item>
            <el-descriptions-item label="封榜时间">
              {{ contest?.freezeBeforeMinutes ? `结束前 ${contest.freezeBeforeMinutes} 分钟` : '不封榜' }}
            </el-descriptions-item>
            <el-descriptions-item label="我的状态">
              {{ contest?.registered ? '已报名' : '未报名' }}
            </el-descriptions-item>
          </el-descriptions>

          <div class="section">
            <h3>比赛说明</h3>
            <markdown-viewer :content="contest?.description || '暂无说明'" />
          </div>

          <div class="section">
            <h3>题目列表</h3>
            <el-table :data="contestProblems" border style="width: 100%">
              <el-table-column prop="label" label="#" width="80" />
              <el-table-column label="题目" min-width="220">
                <template #default="{ row }">
                  {{ hasContestStarted ? row.problem?.title || `题目 ${row.problemId}` : '比赛开始后可查看' }}
                </template>
              </el-table-column>
              <el-table-column label="分值" width="100">
                <template #default="{ row }">{{ row.score ?? '-' }}</template>
              </el-table-column>
              <el-table-column label="操作" width="120">
                <template #default="{ row }">
                  <el-button
                    type="primary"
                    link
                    :disabled="!hasContestStarted"
                    @click="goProblem(row.problemId)"
                  >
                    {{ hasContestStarted ? '做题' : '未开始' }}
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <el-tab-pane label="排名" name="rank">
          <el-alert
            v-if="contestStore.currentRank?.frozen"
            :title="`当前处于封榜状态，封榜时间：${formatDate(contestStore.currentRank.freezeTime)}`"
            type="warning"
            show-icon
            class="rank-alert"
          />
          <el-table
            v-loading="contestStore.rankLoading"
            :data="contestStore.currentRank?.rankings || []"
            border
            style="width: 100%"
          >
            <el-table-column prop="rank" label="排名" width="80" fixed />
            <el-table-column label="用户" width="140" fixed>
              <template #default="{ row }">
                {{ row.nickname || row.username || row.userId }}
              </template>
            </el-table-column>
            <el-table-column prop="solvedCount" label="解题" width="90" />
            <el-table-column prop="totalScore" label="总分" width="90" />
            <el-table-column prop="penalty" label="罚时" width="90" />
            <el-table-column
              v-for="problem in contestProblems"
              :key="problem.id || problem.problemId"
              :label="problem.label"
              min-width="120"
            >
              <template #default="{ row }">
                <div class="rank-problem-cell" :class="{ accepted: getRankProblem(row, problem.problemId)?.accepted }">
                  <strong>{{ getRankProblem(row, problem.problemId)?.score ?? 0 }}</strong>
                  <span>
                    {{ getRankProblem(row, problem.problemId)?.submissionCount ?? 0 }} 次
                    <template v-if="getRankProblem(row, problem.problemId)?.penalty">
                      / {{ getRankProblem(row, problem.problemId)?.penalty }}
                    </template>
                  </span>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <div v-else-if="contest" class="access-limited">
        <el-alert
          v-if="canRegister"
          title="报名后才可查看比赛详情"
          type="info"
          show-icon
          :closable="false"
        />
        <el-alert
          v-else
          title="比赛已开始，报名已截止"
          type="warning"
          show-icon
          :closable="false"
        />
        <el-button
          v-if="canRegister"
          type="primary"
          class="access-action"
          @click="registerDialogVisible = true"
        >
          报名比赛
        </el-button>
      </div>
    </el-card>

    <el-dialog v-model="registerDialogVisible" title="报名比赛" width="420px">
      <el-form>
        <el-form-item label="邀请码">
          <el-input
            v-model="inviteCode"
            maxlength="10"
            placeholder="如不需要邀请码可留空"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="registerDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submittingRegister" @click="handleRegister">
          确认报名
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useContestStore } from '@/stores/contest'
import MarkdownViewer from '@/components/MarkdownViewer/index.vue'
import type { ContestRankProblemVO, ContestRankUserVO } from '@/types/contest'
import { formatDateTime } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const contestStore = useContestStore()
const contestId = route.params.id as string
const activeTab = ref('detail')
const registerDialogVisible = ref(false)
const submittingRegister = ref(false)
const inviteCode = ref('')

const contest = computed(() => contestStore.currentContest)
const contestProblems = computed(() => {
  return [...(contest.value?.problems || [])].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
})

const canRegister = computed(() => {
  if (!contest.value || contest.value.status !== 1) return false
  return Date.now() < new Date(contest.value.startTime).getTime()
})

const canCancelRegistration = computed(() => {
  if (!contest.value?.registered) return false
  return Date.now() < new Date(contest.value.startTime).getTime()
})

const canViewContestDetail = computed(() => {
  return !!contest.value?.registered
})

const hasContestStarted = computed(() => {
  if (!contest.value?.startTime) return false
  return Date.now() >= new Date(contest.value.startTime).getTime()
})

const getRuleText = (ruleType?: number) => {
  const texts: Record<number, string> = { 1: 'ACM/ICPC', 2: 'IOI', 3: 'Codeforces' }
  return ruleType ? texts[ruleType] || '未知' : '未知'
}

const getStatusText = (status?: number) => {
  const texts: Record<number, string> = { 0: '草稿', 1: '已发布', 2: '已取消' }
  return status === undefined ? '未知' : texts[status] || '未知'
}

const getStatusTagType = (status?: number) => {
  const types: Record<number, string> = { 0: 'info', 1: 'success', 2: 'danger' }
  return status === undefined ? 'info' : types[status] || 'info'
}

const formatDate = (value?: string) => (value ? formatDateTime(value) : '-')

const getRankProblem = (
  row: ContestRankUserVO,
  problemId: string
): ContestRankProblemVO | undefined => {
  return row.problems?.find((item) => String(item.problemId) === String(problemId))
}

const handleTabChange = (name: string | number) => {
  if (name === 'rank' && canViewContestDetail.value) {
    contestStore.fetchContestRank(contestId)
  }
}

const goProblem = (problemId: string) => {
  if (!canViewContestDetail.value) {
    ElMessage.warning('报名后才可查看比赛详情')
    return
  }
  if (!hasContestStarted.value) {
    ElMessage.warning('比赛开始前不能查看题目详情')
    return
  }
  router.push({
    path: `/problem/${problemId}`,
    query: { contestId }
  })
}

const handleRegister = async () => {
  if (!canRegister.value) {
    ElMessage.warning('比赛开始后不能报名')
    return
  }

  submittingRegister.value = true
  try {
    const ok = await contestStore.register(contestId, { inviteCode: inviteCode.value || undefined })
    if (ok) {
      ElMessage.success('报名成功')
      registerDialogVisible.value = false
      inviteCode.value = ''
    }
  } catch (error) {
    console.error('Register contest failed:', error)
  } finally {
    submittingRegister.value = false
  }
}

const handleCancelRegistration = async () => {
  try {
    await ElMessageBox.confirm('确认取消当前比赛报名吗？比赛开始后不能取消报名。', '取消报名', {
      type: 'warning'
    })
    const ok = await contestStore.cancelRegistration(contestId)
    if (ok) {
      ElMessage.success('已取消报名')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Cancel contest registration failed:', error)
    }
  }
}

onMounted(() => {
  contestStore.fetchContestDetail(contestId)
})
</script>

<style scoped lang="scss">
.contest-detail-container {
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

  .rank-alert {
    margin-bottom: 16px;
  }

  .access-limited {
    padding: 32px 0;

    .access-action {
      margin-top: 18px;
    }
  }

  .rank-problem-cell {
    display: flex;
    flex-direction: column;
    gap: 4px;

    span {
      color: #909399;
      font-size: 12px;
    }

    &.accepted strong {
      color: #67c23a;
    }
  }
}
</style>
