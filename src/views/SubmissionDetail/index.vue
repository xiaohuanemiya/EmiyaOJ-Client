<!-- src/views/SubmissionDetail/index.vue -->
<template>
  <div class="submission-detail-container">
    <el-card v-loading="submissionStore.loading">
      <template #header>
        <div class="header-content">
          <h2>提交详情 #{{ submissionId }}</h2>
          <status-tag :status="currentSubmission?.status" size="large" />
        </div>
      </template>

      <!-- 提交信息 -->
      <el-descriptions :column="2" border>
        <el-descriptions-item label="题目ID">
          {{ currentSubmission?.problemId }}
        </el-descriptions-item>
        <el-descriptions-item label="比赛ID">
          {{ currentSubmission?.contestId || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="比赛题目ID">
          {{ currentSubmission?.contestProblemId || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="语言ID">
          {{ currentSubmission?.languageId }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <status-tag :status="currentSubmission?.status" />
        </el-descriptions-item>
        <el-descriptions-item label="得分">
          {{ currentSubmission?.score ?? '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="通过用例">
          {{ currentSubmission ? `${currentSubmission.passedCaseCount} / ${currentSubmission.totalCaseCount}` : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="最高用时">
          {{ currentSubmission?.maxTimeUsed ? `${currentSubmission.maxTimeUsed}ms` : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="最高内存">
          {{ currentSubmission?.maxMemoryUsed ? `${currentSubmission.maxMemoryUsed}KB` : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="提交时间">
          {{ currentSubmission?.createTime }}
        </el-descriptions-item>
        <el-descriptions-item label="完成时间">
          {{ currentSubmission?.finishTime || '-' }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 错误信息 -->
      <div v-if="currentSubmission?.errorMessage" class="judge-info-section">
        <h3>错误信息</h3>
        <pre>{{ currentSubmission.errorMessage }}</pre>
      </div>

      <!-- 编译信息 -->
      <div v-if="currentSubmission?.compileMessage" class="judge-info-section">
        <h3>编译信息</h3>
        <pre>{{ currentSubmission.compileMessage }}</pre>
      </div>

      <!-- 测试用例明细 -->
      <div
        v-if="currentSubmission?.caseResults && currentSubmission.caseResults.length > 0"
        class="judge-info-section"
      >
        <h3>测试用例明细</h3>
        <el-table :data="currentSubmission.caseResults" border stripe style="width: 100%">
          <el-table-column prop="caseOrder" label="#" width="60" />
          <el-table-column label="状态" width="120">
            <template #default="{ row }">
              <status-tag :status="row.status" />
            </template>
          </el-table-column>
          <el-table-column label="得分" width="80">
            <template #default="{ row }">
              {{ row.score }}
            </template>
          </el-table-column>
          <el-table-column label="用时" width="100">
            <template #default="{ row }">
              {{ row.timeUsed ? `${row.timeUsed}ms` : '-' }}
            </template>
          </el-table-column>
          <el-table-column label="内存" width="100">
            <template #default="{ row }">
              {{ row.memoryUsed ? `${row.memoryUsed}KB` : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="errorMessage" label="错误信息" min-width="200">
            <template #default="{ row }">
              {{ row.errorMessage || '-' }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSubmissionStore } from '@/stores/submission'
import StatusTag from '@/components/StatusTag/index.vue'

const route = useRoute()
const submissionStore = useSubmissionStore()

const submissionId = route.params.id as string
const currentSubmission = computed(() => submissionStore.currentSubmission)

onMounted(() => {
  submissionStore.fetchSubmissionDetail(submissionId)
})
</script>

<style scoped lang="scss">
.submission-detail-container {
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

  .judge-info-section {
    margin-top: 30px;

    h3 {
      margin-bottom: 15px;
      color: #303133;
      font-size: 16px;
      font-weight: 600;
    }

    pre {
      background-color: #f5f7fa;
      padding: 15px;
      border-radius: 4px;
      overflow-x: auto;
    }
  }
}
</style>
