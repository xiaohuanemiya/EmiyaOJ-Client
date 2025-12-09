<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { problemAPI } from '@/api/problem'
import { submissionAPI } from '@/api/submission'
import { languageAPI } from '@/api/language'
import { useSubmissionPolling } from '@/composables/useSubmissionPolling'
import MainLayout from '@/layout/MainLayout.vue'
import type { ProblemVO, Language, SubmissionStatus } from '@/types/api'

const route = useRoute()
const router = useRouter()
const { submission, startPolling } = useSubmissionPolling()

const loading = ref(false)
const submitting = ref(false)
const resultDialogVisible = ref(false)

const problem = ref<ProblemVO | null>(null)
const languages = ref<Language[]>([])

const submitForm = reactive({
  problemId: 0,
  languageId: undefined as number | undefined,
  code: ''
})

/** 获取题目详情 */
const getProblemDetail = async () => {
  const problemId = Number(route.params.id)
  if (!problemId) return
  
  loading.value = true
  try {
    const res = await problemAPI.getDetail(problemId)
    problem.value = res.data.data
    submitForm.problemId = problemId
  } catch (error) {
    console.error('获取题目详情失败:', error)
  } finally {
    loading.value = false
  }
}

/** 获取语言列表 */
const getLanguages = async () => {
  try {
    const res = await languageAPI.getList()
    languages.value = res.data.data
    // 默认选择第一个语言
    if (languages.value && languages.value.length > 0 && languages.value[0]) {
      submitForm.languageId = languages.value[0].id
    }
  } catch (error) {
    console.error('获取语言列表失败:', error)
  }
}

/** 提交代码 */
const handleSubmit = async () => {
  if (!submitForm.languageId) {
    ElMessage.warning('请选择编程语言')
    return
  }
  
  if (!submitForm.code.trim()) {
    ElMessage.warning('请输入代码')
    return
  }
  
  submitting.value = true
  
  try {
    // 提交代码
    const res = await submissionAPI.submit({
      problemId: submitForm.problemId,
      languageId: submitForm.languageId,
      code: submitForm.code
    })
    const submissionId = res.data.data
    
    ElMessage.success('提交成功，正在判题...')
    
    // 开始轮询判题结果
    await startPolling(submissionId)
    
    // 显示结果对话框
    resultDialogVisible.value = true
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    submitting.value = false
  }
}

/** 跳转到提交记录页面 */
const goToSubmissions = () => {
  router.push('/submissions')
}

/** 获取难度类型 */
const getDifficultyType = (difficulty?: number) => {
  const typeMap: Record<number, 'success' | 'warning' | 'danger'> = {
    1: 'success',
    2: 'warning',
    3: 'danger'
  }
  return difficulty ? typeMap[difficulty] : 'success'
}

/** 获取难度文本 */
const getDifficultyText = (difficulty?: number) => {
  const textMap: Record<number, string> = {
    1: '简单',
    2: '中等',
    3: '困难'
  }
  return difficulty ? textMap[difficulty] : ''
}

/** 获取状态类型 */
const getStatusType = (status: SubmissionStatus) => {
  if (status === 'Accepted') return 'success'
  if (status === 'Pending' || status === 'Running') return 'info'
  return 'danger'
}

onMounted(() => {
  getProblemDetail()
  getLanguages()
})
</script>

<template>
  <MainLayout>
    <div class="problem-detail">
      <!-- 题目信息 -->
      <el-card v-loading="loading" class="problem-card">
        <template #header>
          <div class="card-header">
            <h2>{{ problem?.title }}</h2>
            <div class="problem-meta">
              <el-tag :type="getDifficultyType(problem?.difficulty)">
                {{ getDifficultyText(problem?.difficulty) }}
              </el-tag>
              <span>时间限制: {{ problem?.timeLimit }}ms</span>
              <span>内存限制: {{ problem?.memoryLimit }}MB</span>
            </div>
          </div>
        </template>
        
        <div v-if="problem" class="problem-content">
          <section>
            <h3>题目描述</h3>
            <p class="content-text">{{ problem.description }}</p>
          </section>
          
          <section>
            <h3>输入描述</h3>
            <p class="content-text">{{ problem.inputDescription }}</p>
          </section>
          
          <section>
            <h3>输出描述</h3>
            <p class="content-text">{{ problem.outputDescription }}</p>
          </section>
          
          <section>
            <h3>样例输入</h3>
            <pre class="sample-box">{{ problem.sampleInput }}</pre>
          </section>
          
          <section>
            <h3>样例输出</h3>
            <pre class="sample-box">{{ problem.sampleOutput }}</pre>
          </section>
          
          <section v-if="problem.hint">
            <h3>提示</h3>
            <p class="content-text">{{ problem.hint }}</p>
          </section>
        </div>
      </el-card>

      <!-- 代码编辑器 -->
      <el-card class="code-editor">
        <template #header>
          <div class="editor-header">
            <div class="language-selector">
              <span>选择语言：</span>
              <el-select v-model="submitForm.languageId" placeholder="选择语言">
                <el-option
                  v-for="lang in languages"
                  :key="lang.id"
                  :label="`${lang.name} (${lang.version})`"
                  :value="lang.id"
                />
              </el-select>
            </div>
            
            <el-button 
              type="primary" 
              :loading="submitting"
              @click="handleSubmit"
            >
              提交代码
            </el-button>
          </div>
        </template>
        
        <el-input
          v-model="submitForm.code"
          type="textarea"
          :rows="20"
          placeholder="请输入代码..."
          class="code-input"
        />
      </el-card>

      <!-- 判题结果对话框 -->
      <el-dialog 
        v-model="resultDialogVisible" 
        title="判题结果"
        width="600px"
      >
        <div v-if="submission" class="result-content">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusType(submission.status)">
                {{ submission.status }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="得分">
              {{ submission.score }}
            </el-descriptions-item>
            <el-descriptions-item label="运行时间">
              {{ submission.timeUsed }}ms
            </el-descriptions-item>
            <el-descriptions-item label="内存消耗">
              {{ submission.memoryUsed }}KB
            </el-descriptions-item>
            <el-descriptions-item label="通过率">
              {{ submission.passRate }}
            </el-descriptions-item>
            <el-descriptions-item label="提交时间">
              {{ submission.createTime }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
        
        <template #footer>
          <el-button @click="resultDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="goToSubmissions">
            查看所有提交
          </el-button>
        </template>
      </el-dialog>
    </div>
  </MainLayout>
</template>

<style scoped>
.problem-detail {
  max-width: 1200px;
  margin: 0 auto;
}

.problem-card {
  margin-bottom: 20px;
}

.card-header h2 {
  margin: 0 0 10px 0;
  font-size: 24px;
  color: #333;
}

.problem-meta {
  display: flex;
  gap: 20px;
  align-items: center;
  color: #666;
  font-size: 14px;
}

.problem-content section {
  margin-bottom: 24px;
}

.problem-content h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #333;
  font-weight: 600;
}

.content-text {
  margin: 0;
  line-height: 1.6;
  color: #555;
  white-space: pre-wrap;
}

.sample-box {
  background-color: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
}

.code-editor {
  margin-bottom: 20px;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.language-selector {
  display: flex;
  align-items: center;
  gap: 10px;
}

.code-input {
  font-family: 'Courier New', monospace;
}

.result-content {
  padding: 20px 0;
}
</style>
