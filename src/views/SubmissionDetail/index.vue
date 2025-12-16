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
        <el-descriptions-item label="题目">
          {{ currentSubmission?.problemTitle }}
        </el-descriptions-item>
        <el-descriptions-item label="语言">
          {{ currentSubmission?.languageName }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <status-tag :status="currentSubmission?.status" />
        </el-descriptions-item>
        <el-descriptions-item label="得分" v-if="currentSubmission?.score !== undefined">
          {{ currentSubmission.score }}
        </el-descriptions-item>
        <el-descriptions-item label="用时">
          {{ currentSubmission?.timeUsed ? `${currentSubmission.timeUsed}ms` : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="内存">
          {{ currentSubmission?.memoryUsed ? `${currentSubmission.memoryUsed}KB` : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="通过率" v-if="currentSubmission?.passRate">
          {{ currentSubmission.passRate }}
        </el-descriptions-item>
        <el-descriptions-item label="提交时间">
          {{ currentSubmission?.createTime }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 判题信息 -->
      <div v-if="currentSubmission?.judgeInfo" class="judge-info-section">
        <h3>判题信息</h3>
        <pre>{{ formatJudgeInfo(currentSubmission.judgeInfo) }}</pre>
      </div>

      <!-- 提交代码 -->
      <div class="code-section">
        <h3>提交代码</h3>
        <code-editor
          :model-value="currentSubmission?.code || ''"
          :language="getLanguageMode(currentSubmission?.languageName)"
          :readonly="true"
          height="500px"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSubmissionStore } from '@/stores/submission'
import CodeEditor from '@/components/CodeEditor/index.vue'
import StatusTag from '@/components/StatusTag/index.vue'

const route = useRoute()
const submissionStore = useSubmissionStore()

const submissionId = Number(route.params.id)
const currentSubmission = computed(() => submissionStore.currentSubmission)

const getLanguageMode = (language?: string) => {
  const modeMap: Record<string, string> = {
    'Java': 'java',
    'C': 'c',
    'C++': 'cpp',
    'Python': 'python',
    'JavaScript': 'javascript'
  }
  return modeMap[language || ''] || 'plaintext'
}

const formatJudgeInfo = (judgeInfo: string) => {
  try {
    return JSON.stringify(JSON.parse(judgeInfo), null, 2)
  } catch {
    return judgeInfo
  }
}

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

  .judge-info-section,
  .code-section {
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
