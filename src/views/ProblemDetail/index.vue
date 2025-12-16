<!-- src/views/ProblemDetail/index.vue -->
<template>
  <div class="problem-detail-container">
    <el-row :gutter="20">
      <!-- 左侧：题目描述 -->
      <el-col :span="12">
        <el-card v-loading="problemStore.loading">
          <template #header>
            <div class="problem-header">
              <h2>{{ currentProblem?.id }}. {{ currentProblem?.title }}</h2>
              <el-tag
                :type="getDifficultyType(currentProblem?.difficulty)"
                size="large"
              >
                {{ getDifficultyText(currentProblem?.difficulty) }}
              </el-tag>
            </div>
          </template>

          <!-- 题目描述 -->
          <div class="problem-section">
            <h3>题目描述</h3>
            <markdown-viewer :content="currentProblem?.description || ''" />
          </div>

          <!-- 输入格式 -->
          <div class="problem-section" v-if="currentProblem?.inputDescription">
            <h3>输入格式</h3>
            <markdown-viewer :content="currentProblem?.inputDescription || ''" />
          </div>

          <!-- 输出格式 -->
          <div class="problem-section" v-if="currentProblem?.outputDescription">
            <h3>输出格式</h3>
            <markdown-viewer :content="currentProblem?.outputDescription || ''" />
          </div>

          <!-- 示例 -->
          <div
            v-if="currentProblem?.sampleInput || currentProblem?.sampleOutput"
            class="problem-section"
          >
            <h3>示例</h3>
            <div class="example-block">
              <div class="example-item" v-if="currentProblem?.sampleInput">
                <strong>输入：</strong>
                <pre>{{ currentProblem.sampleInput }}</pre>
              </div>
              <div class="example-item" v-if="currentProblem?.sampleOutput">
                <strong>输出：</strong>
                <pre>{{ currentProblem.sampleOutput }}</pre>
              </div>
            </div>
          </div>

          <!-- 提示 -->
          <div class="problem-section" v-if="currentProblem?.hint">
            <h3>提示</h3>
            <markdown-viewer :content="currentProblem?.hint || ''" />
          </div>

          <!-- 限制 -->
          <div class="problem-section">
            <h3>限制</h3>
            <ul>
              <li>时间限制：{{ currentProblem?.timeLimit }}ms</li>
              <li>内存限制：{{ currentProblem?.memoryLimit }}MB</li>
            </ul>
          </div>

          <!-- 标签 -->
          <div class="problem-section" v-if="currentProblem?.tags && currentProblem.tags.length > 0">
            <h3>标签</h3>
            <el-tag
              v-for="tag in currentProblem?.tags"
              :key="tag"
              style="margin-right: 10px"
            >
              {{ tag }}
            </el-tag>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：代码编辑器 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="editor-header">
              <h3>代码编辑器</h3>
              <el-select
                v-model="selectedLanguageId"
                placeholder="选择语言"
                style="width: 200px"
              >
                <el-option
                  v-for="lang in languageStore.languages"
                  :key="lang.id"
                  :label="lang.name"
                  :value="lang.id"
                />
              </el-select>
            </div>
          </template>

          <!-- 代码编辑器 -->
          <code-editor
            v-model="code"
            :language="getLanguageMode(selectedLanguageId)"
            height="600px"
          />

          <!-- 提交按钮 -->
          <div class="submit-actions">
            <el-button
              type="primary"
              size="large"
              :loading="submitting"
              @click="handleSubmit"
            >
              提交代码
            </el-button>
            <el-button size="large" @click="handleReset">
              重置代码
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useProblemStore } from '@/stores/problem'
import { useLanguageStore } from '@/stores/language'
import { useSubmissionStore } from '@/stores/submission'
import CodeEditor from '@/components/CodeEditor/index.vue'
import MarkdownViewer from '@/components/MarkdownViewer/index.vue'

const route = useRoute()
const router = useRouter()
const problemStore = useProblemStore()
const languageStore = useLanguageStore()
const submissionStore = useSubmissionStore()

const problemId = Number(route.params.id)
const selectedLanguageId = ref<number>(1)
const code = ref('')
const submitting = ref(false)

const currentProblem = computed(() => problemStore.currentProblem)

const getDifficultyType = (difficulty?: number) => {
  if (difficulty === undefined) return 'info'
  const types = ['success', 'warning', 'danger']
  return types[difficulty] || 'info'
}

const getDifficultyText = (difficulty?: number) => {
  if (difficulty === undefined) return '未知'
  const texts = ['简单', '中等', '困难']
  return texts[difficulty] || '未知'
}

const getLanguageMode = (languageId: number) => {
  const language = languageStore.languages.find(l => l.id === languageId)
  const modeMap: Record<string, string> = {
    'Java': 'java',
    'C': 'c',
    'C++': 'cpp',
    'Python': 'python',
    'JavaScript': 'javascript'
  }
  return modeMap[language?.name || ''] || 'plaintext'
}

const handleSubmit = async () => {
  if (!code.value.trim()) {
    ElMessage.warning('请输入代码')
    return
  }

  submitting.value = true
  try {
    const submissionId = await submissionStore.submitCode({
      problemId: problemId,
      languageId: selectedLanguageId.value,
      code: code.value
    })

    if (submissionId) {
      ElMessage.success('提交成功')
      router.push(`/submission/${submissionId}`)
    } else {
      ElMessage.error('提交失败')
    }
  } catch (error) {
    console.error('Submit error:', error)
    ElMessage.error('提交失败')
  } finally {
    submitting.value = false
  }
}

const handleReset = () => {
  code.value = ''
  ElMessage.info('代码已重置')
}

onMounted(async () => {
  await problemStore.fetchProblemDetail(problemId)
  await languageStore.fetchLanguages()
  
  // 设置默认语言
  if (languageStore.languages.length > 0 && languageStore.languages[0]) {
    selectedLanguageId.value = languageStore.languages[0].id
  }
})
</script>

<style scoped lang="scss">
.problem-detail-container {
  padding: 20px;

  .problem-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      margin: 0;
    }
  }

  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
    }
  }

  .problem-section {
    margin-bottom: 30px;

    h3 {
      color: #303133;
      margin-bottom: 15px;
      font-size: 16px;
      font-weight: 600;
    }

    ul {
      list-style: none;
      padding: 0;

      li {
        padding: 5px 0;
      }
    }
  }

  .example-block {
    .example-item {
      margin-bottom: 15px;

      pre {
        background-color: #f5f7fa;
        padding: 15px;
        border-radius: 4px;
        margin-top: 5px;
        overflow-x: auto;
      }
    }
  }

  .submit-actions {
    margin-top: 20px;
    text-align: center;

    .el-button {
      margin: 0 10px;
    }
  }
}
</style>
