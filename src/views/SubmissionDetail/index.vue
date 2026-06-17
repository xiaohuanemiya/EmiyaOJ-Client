<template>
  <div class="submission-detail-container">
    <el-card v-loading="submissionStore.loading" class="detail-card">
      <template #header>
        <div class="header-content">
          <div>
            <div class="eyebrow">SUBMISSION</div>
            <h2>提交详情 <span>#{{ submissionId }}</span></h2>
          </div>
          <div class="header-actions">
            <status-tag :status="currentSubmission?.status" size="large" />
            <el-button :icon="Refresh" circle title="刷新提交详情" @click="handleRefresh" />
          </div>
        </div>
      </template>

      <template v-if="currentSubmission">
        <div class="result-overview">
          <div class="overview-item score-item">
            <span class="overview-label">得分</span>
            <strong>{{ currentSubmission.score ?? '-' }}</strong>
          </div>
          <div class="overview-item">
            <span class="overview-label">通过用例</span>
            <strong>{{ currentSubmission.passedCaseCount }} / {{ currentSubmission.totalCaseCount }}</strong>
          </div>
          <div class="overview-item">
            <span class="overview-label">最高用时</span>
            <strong>{{ formatMetric(currentSubmission.maxTimeUsed, 'ms') }}</strong>
          </div>
          <div class="overview-item">
            <span class="overview-label">最高内存</span>
            <strong>{{ formatMetric(currentSubmission.maxMemoryUsed, 'KB') }}</strong>
          </div>
        </div>

        <el-alert
          v-if="isJudging"
          title="判题正在进行中，结果会自动更新"
          type="info"
          show-icon
          :closable="false"
          class="status-alert"
        />

        <el-descriptions :column="3" border class="submission-meta">
          <el-descriptions-item label="题目 ID">{{ currentSubmission.problemId }}</el-descriptions-item>
          <el-descriptions-item label="比赛 ID">{{ currentSubmission.contestId || '-' }}</el-descriptions-item>
          <el-descriptions-item label="比赛题目 ID">{{ currentSubmission.contestProblemId || '-' }}</el-descriptions-item>
          <el-descriptions-item label="语言 ID">{{ currentSubmission.languageId }}</el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ formatDateTime(currentSubmission.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="完成时间">
            {{ currentSubmission.finishTime ? formatDateTime(currentSubmission.finishTime) : '-' }}
          </el-descriptions-item>
        </el-descriptions>

        <section v-if="showFeedback" class="feedback-section">
          <div class="section-heading">
            <div class="section-title">
              <span class="section-icon feedback-icon"><MagicStick /></span>
              <div>
                <h3>智能判题反馈</h3>
                <p>结合本次判题结果生成的调试建议</p>
              </div>
            </div>
            <el-tag v-if="feedback" type="primary" effect="light">
              AI 智能反馈
            </el-tag>
            <el-tag v-else-if="feedbackQueryFailed" type="danger" effect="plain">
              查询失败
            </el-tag>
            <el-tag v-else type="info" effect="plain" class="polling-tag">
              <el-icon><Loading /></el-icon>
              查询中
            </el-tag>
          </div>

          <div v-if="feedback?.content" class="feedback-content">
            <MarkdownViewer :content="feedback.content" />
          </div>
          <el-result
            v-else-if="feedbackQueryFailed"
            icon="warning"
            title="智能反馈查询失败"
            sub-title="请检查网络状态后重新查询"
          >
            <template #extra>
              <el-button type="primary" :icon="Refresh" @click="startFeedbackPolling">
                重新查询
              </el-button>
            </template>
          </el-result>
          <div v-else-if="!feedback" class="feedback-loading">
            <el-icon class="feedback-spinner"><Loading /></el-icon>
            <div class="polling-status">
              <span>系统正在持续查询智能反馈，结果生成后将自动展示</span>
            </div>
          </div>
          <el-empty v-else description="反馈已生成，暂无可展示内容" :image-size="72" />

          <p class="feedback-notice">
            反馈由 AI 生成，仅供调试参考，请结合题意和测试结果判断。
          </p>
        </section>

        <section v-if="currentSubmission.errorMessage" class="judge-info-section error-section">
          <div class="section-heading">
            <div class="section-title">
              <span class="section-icon error-icon"><WarningFilled /></span>
              <div>
                <h3>错误信息</h3>
                <p>判题器返回的错误摘要</p>
              </div>
            </div>
          </div>
          <pre>{{ currentSubmission.errorMessage }}</pre>
        </section>

        <section v-if="currentSubmission.compileMessage" class="judge-info-section">
          <div class="section-heading">
            <div class="section-title">
              <span class="section-icon"><Document /></span>
              <div>
                <h3>编译信息</h3>
                <p>编译器输出</p>
              </div>
            </div>
          </div>
          <pre>{{ currentSubmission.compileMessage }}</pre>
        </section>

        <section
          v-if="currentSubmission.caseResults && currentSubmission.caseResults.length > 0"
          class="judge-info-section"
        >
          <div class="section-heading">
            <div class="section-title">
              <span class="section-icon"><DataAnalysis /></span>
              <div>
                <h3>测试用例明细</h3>
                <p>展开测试点可查看公开样例预览和输出差异摘要</p>
              </div>
            </div>
          </div>

          <el-table
            :data="currentSubmission.caseResults"
            row-key="id"
            stripe
            class="case-table"
          >
            <el-table-column type="expand">
              <template #default="{ row }">
                <div class="case-expanded">
                  <div v-if="row.outputDiffSummary" class="diff-summary">
                    <span>输出差异摘要</span>
                    <p>{{ row.outputDiffSummary }}</p>
                  </div>

                  <div v-if="row.isSample === 1" class="preview-grid">
                    <div class="preview-panel">
                      <span>样例输入</span>
                      <pre>{{ previewText(row.inputPreview) }}</pre>
                    </div>
                    <div class="preview-panel expected-panel">
                      <span>期望输出</span>
                      <pre>{{ previewText(row.expectedOutputPreview) }}</pre>
                    </div>
                    <div class="preview-panel actual-panel">
                      <span>实际输出</span>
                      <pre>{{ previewText(row.actualOutputPreview) }}</pre>
                    </div>
                  </div>

                  <div v-else class="hidden-case-notice">
                    <el-icon><Lock /></el-icon>
                    <span>隐藏测试点不会展示原始输入和输出，仅提供脱敏后的差异摘要。</span>
                  </div>

                  <div v-if="row.errorMessage" class="case-error">
                    <strong>测试点错误信息</strong>
                    <pre>{{ row.errorMessage }}</pre>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="caseOrder" label="#" width="60" />
            <el-table-column label="类型" width="110">
              <template #default="{ row }">
                <el-tag :type="row.isSample === 1 ? 'success' : 'info'" effect="plain">
                  {{ row.isSample === 1 ? '公开样例' : '隐藏测试点' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="120">
              <template #default="{ row }">
                <status-tag :status="row.status" />
              </template>
            </el-table-column>
            <el-table-column prop="score" label="得分" width="80" />
          </el-table>
        </section>
      </template>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  DataAnalysis,
  Document,
  Loading,
  Lock,
  MagicStick,
  Refresh,
  WarningFilled
} from '@element-plus/icons-vue'
import { useSubmissionStore } from '@/stores/submission'
import StatusTag from '@/components/StatusTag/index.vue'
import MarkdownViewer from '@/components/MarkdownViewer/index.vue'
import { JUDGE_STATUS } from '@/utils/constants'
import { formatDateTime } from '@/utils/format'

const DETAIL_POLL_INTERVAL = 1000
const DETAIL_MAX_ATTEMPTS = 60
const FEEDBACK_POLL_INTERVAL = 2000

const route = useRoute()
const submissionStore = useSubmissionStore()
const submissionId = String(route.params.id)

const feedbackPolling = ref(false)
const feedbackQueryFailed = ref(false)
let detailAttempts = 0
let detailTimer: ReturnType<typeof setTimeout> | undefined
let feedbackTimer: ReturnType<typeof setTimeout> | undefined
let detailRun = 0
let feedbackRun = 0
let disposed = false

const currentSubmission = computed(() => {
  const submission = submissionStore.currentSubmission
  return submission && String(submission.id) === submissionId ? submission : null
})
const feedback = computed(() => currentSubmission.value?.feedback || null)
const isJudging = computed(() => {
  return currentSubmission.value?.status === JUDGE_STATUS.PENDING
    || currentSubmission.value?.status === JUDGE_STATUS.JUDGING
})
const showFeedback = computed(() => {
  return currentSubmission.value
    && !isJudging.value
    && currentSubmission.value.status !== JUDGE_STATUS.ACCEPTED
})
const formatMetric = (value: number | null | undefined, unit: string) => {
  return value === null || value === undefined ? '-' : `${value}${unit}`
}

const previewText = (value: string | null | undefined) => {
  return value ?? '（无内容）'
}

const clearTimers = () => {
  if (detailTimer) clearTimeout(detailTimer)
  if (feedbackTimer) clearTimeout(feedbackTimer)
}

const pollFeedback = async (run: number) => {
  if (disposed || run !== feedbackRun || feedback.value) {
    feedbackPolling.value = false
    return
  }

  const result = await submissionStore.fetchSubmissionFeedback(submissionId)
  if (disposed || run !== feedbackRun) return

  if (result.state === 'ready') {
    feedbackPolling.value = false
    return
  }

  if (result.state === 'error') {
    feedbackPolling.value = false
    feedbackQueryFailed.value = true
    return
  }

  feedbackTimer = setTimeout(() => void pollFeedback(run), FEEDBACK_POLL_INTERVAL)
}

const startFeedbackPolling = () => {
  if (feedback.value || feedbackPolling.value || disposed) return
  feedbackPolling.value = true
  feedbackQueryFailed.value = false
  feedbackRun += 1
  void pollFeedback(feedbackRun)
}

const loadSubmission = async (silent = false, run = detailRun) => {
  const submission = await submissionStore.fetchSubmissionDetail(submissionId, silent)
  if (!submission || disposed || run !== detailRun) return

  if (submission.status === JUDGE_STATUS.PENDING || submission.status === JUDGE_STATUS.JUDGING) {
    detailAttempts += 1
    if (detailAttempts < DETAIL_MAX_ATTEMPTS) {
      detailTimer = setTimeout(() => void loadSubmission(true, run), DETAIL_POLL_INTERVAL)
    }
    return
  }

  if (submission.status !== JUDGE_STATUS.ACCEPTED && !submission.feedback) {
    startFeedbackPolling()
  }
}

const handleRefresh = async () => {
  clearTimers()
  detailAttempts = 0
  detailRun += 1
  feedbackRun += 1
  feedbackPolling.value = false
  feedbackQueryFailed.value = false
  await loadSubmission(false, detailRun)
}

onMounted(() => {
  detailRun += 1
  void loadSubmission(false, detailRun)
})

onBeforeUnmount(() => {
  disposed = true
  detailRun += 1
  feedbackRun += 1
  clearTimers()
})
</script>

<style scoped lang="scss">
.submission-detail-container {
  width: 100%;
  padding: 20px;
}

.detail-card {
  border: 0;
  border-radius: 12px;
  box-shadow: 0 8px 28px rgb(31 45 61 / 8%);
}

.header-content,
.section-heading,
.section-title,
.header-actions {
  display: flex;
  align-items: center;
}

.header-content {
  justify-content: space-between;
  gap: 16px;

  h2 {
    margin: 3px 0 0;
    color: #1f2937;
    font-size: 22px;

    span {
      color: #909399;
      font-size: 15px;
      font-weight: 500;
    }
  }
}

.header-actions {
  gap: 10px;
}

.eyebrow {
  color: #8b5cf6;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
}

.result-overview {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}

.overview-item {
  min-height: 82px;
  padding: 16px 18px;
  border: 1px solid #ebeef5;
  border-radius: 10px;
  background: linear-gradient(145deg, #fff, #fafbff);

  strong,
  span {
    display: block;
  }

  strong {
    margin-top: 8px;
    color: #303133;
    font-size: 22px;
    line-height: 1;
  }
}

.score-item {
  border-color: #ddd6fe;
  background: linear-gradient(145deg, #f5f3ff, #fff);

  strong {
    color: #7c3aed;
  }
}

.overview-label {
  color: #909399;
  font-size: 13px;
}

.status-alert,
.submission-meta {
  margin-bottom: 22px;
}

.feedback-section,
.judge-info-section {
  margin-top: 26px;
  padding-top: 24px;
  border-top: 1px solid #ebeef5;
}

.feedback-section {
  padding: 22px;
  border: 1px solid #ddd6fe;
  border-radius: 12px;
  background: linear-gradient(145deg, #faf8ff, #fff 60%);
}

.section-heading {
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 16px;
}

.section-title {
  gap: 12px;

  h3,
  p {
    margin: 0;
  }

  h3 {
    color: #303133;
    font-size: 16px;
    font-weight: 650;
  }

  p {
    margin-top: 3px;
    color: #909399;
    font-size: 12px;
  }
}

.section-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  border-radius: 9px;
  background: #ecf5ff;
  color: #409eff;

  svg {
    width: 18px;
  }
}

.feedback-icon {
  background: #ede9fe;
  color: #7c3aed;
}

.error-icon {
  background: #fef0f0;
  color: #f56c6c;
}

.feedback-content {
  padding: 18px;
  border-radius: 9px;
  background: rgb(255 255 255 / 78%);
  color: #374151;
  font-size: 14px;
  line-height: 1.8;
  word-break: break-word;
}

.feedback-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 140px;
  padding: 18px;
  border-radius: 9px;
  background: rgb(255 255 255 / 78%);
}

.feedback-spinner {
  color: #8b5cf6;
  font-size: 34px;
  animation: polling-rotate 1.2s linear infinite;
}

.polling-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;

  .el-icon {
    animation: polling-rotate 1.2s linear infinite;
  }
}

.polling-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  margin-top: 12px;
  color: #909399;
  font-size: 12px;
  text-align: center;
}

@keyframes polling-rotate {
  to {
    transform: rotate(360deg);
  }
}

.feedback-notice {
  margin: 14px 0 0;
  color: #a8abb2;
  font-size: 12px;
  text-align: right;
}

.judge-info-section > pre,
.case-error pre {
  margin: 0;
  padding: 15px;
  overflow-x: auto;
  border-radius: 8px;
  background-color: #f5f7fa;
  color: #4b5563;
  font-family: Consolas, Monaco, monospace;
  white-space: pre-wrap;
  word-break: break-word;
}

.case-table {
  width: 100%;
  overflow: hidden;
  border: 1px solid #ebeef5;
  border-radius: 10px;
}

.case-expanded {
  padding: 18px 28px 22px 68px;
}

.diff-summary {
  margin-bottom: 14px;
  padding: 12px 14px;
  border-left: 3px solid #e6a23c;
  border-radius: 4px 8px 8px 4px;
  background: #fdf6ec;

  span {
    color: #b88230;
    font-size: 12px;
    font-weight: 600;
  }

  p {
    margin: 5px 0 0;
    color: #6b7280;
    font-family: Consolas, Monaco, monospace;
    font-size: 12px;
    line-height: 1.6;
    word-break: break-word;
  }
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.preview-panel {
  overflow: hidden;
  border: 1px solid #d9ecff;
  border-radius: 8px;

  > span {
    display: block;
    padding: 8px 12px;
    background: #ecf5ff;
    color: #337ecc;
    font-size: 12px;
    font-weight: 600;
  }

  pre {
    min-height: 76px;
    max-height: 240px;
    margin: 0;
    padding: 12px;
    overflow: auto;
    background: #fff;
    color: #374151;
    font-family: Consolas, Monaco, monospace;
    font-size: 12px;
    white-space: pre-wrap;
    word-break: break-word;
  }
}

.expected-panel {
  border-color: #e1f3d8;

  > span {
    background: #f0f9eb;
    color: #529b2e;
  }
}

.actual-panel {
  border-color: #faecd8;

  > span {
    background: #fdf6ec;
    color: #b88230;
  }
}

.hidden-case-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px;
  border-radius: 8px;
  background: #f5f7fa;
  color: #909399;
  font-size: 13px;
}

.case-error {
  margin-top: 14px;

  strong {
    display: block;
    margin-bottom: 8px;
    color: #f56c6c;
    font-size: 12px;
  }
}

@media (max-width: 900px) {
  .result-overview {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .preview-grid {
    grid-template-columns: 1fr;
  }

  .case-expanded {
    padding-left: 20px;
  }
}

@media (max-width: 560px) {
  .submission-detail-container {
    padding: 10px;
  }

  .header-content,
  .section-heading {
    align-items: flex-start;
  }

  .header-content {
    flex-direction: column;
  }

  .result-overview {
    grid-template-columns: 1fr;
  }

  .feedback-section {
    padding: 16px;
  }
}
</style>
