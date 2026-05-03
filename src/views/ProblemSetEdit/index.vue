<template>
  <div class="problem-set-edit-container">
    <el-card v-loading="problemSetStore.detailLoading">
      <template #header>
        <div class="header-content">
          <h2>{{ isEdit ? '编辑题单' : '创建题单' }}</h2>
          <div>
            <el-button @click="router.back()">返回</el-button>
            <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
          </div>
        </div>
      </template>

      <el-form :model="form" label-width="90px">
        <el-form-item label="标题" required>
          <el-input v-model="form.title" maxlength="80" show-word-limit />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio-button :value="1">公开</el-radio-button>
            <el-radio-button :value="0">隐藏</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="form.description" type="textarea" :rows="5" />
        </el-form-item>
      </el-form>

      <div class="section-header">
        <h3>题目关系</h3>
        <el-button type="primary" plain @click="openSearchDialog">添加题目</el-button>
      </div>

      <el-table :data="problemRows" border style="width: 100%">
        <el-table-column label="题目" min-width="220">
          <template #default="{ row }">
            <div v-if="row.problemTitle" class="problem-cell">
              <span class="problem-title">{{ row.problemTitle }}</span>
              <el-tag
                v-if="row.problemDifficulty"
                :type="getDifficultyType(row.problemDifficulty)"
                size="small"
                class="problem-difficulty-tag"
              >
                {{ getDifficultyText(row.problemDifficulty) }}
              </el-tag>
            </div>
            <span v-else class="no-problem">未选择题目</span>
          </template>
        </el-table-column>
        <el-table-column label="排序" width="120">
          <template #default="{ row, $index }">
            <el-input-number v-model="row.sortOrder" :min="1" :controls="false" style="width: 90px" />
            <el-button link size="small" @click="row.sortOrder = $index + 1">重排</el-button>
          </template>
        </el-table-column>
        <el-table-column label="备注" min-width="220">
          <template #default="{ row }">
            <el-input v-model="row.note" placeholder="可选" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="90">
          <template #default="{ $index }">
            <el-button type="danger" link @click="removeProblemRow($index)">移除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 搜索题目对话框 -->
    <el-dialog
      v-model="searchDialogVisible"
      title="搜索题目"
      width="900px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div class="search-problem-dialog">
        <div class="search-bar">
          <el-input
            v-model="searchKeyword"
            placeholder="输入题目标题搜索"
            clearable
            @keyup.enter="handleProblemSearch"
            @clear="handleProblemSearch"
          >
            <template #append>
              <el-button :icon="Search" :loading="searchLoading" @click="handleProblemSearch" />
            </template>
          </el-input>
        </div>

        <div class="search-results">
          <el-table
            v-loading="searchLoading"
            :data="searchResults"
            border
            style="width: 100%"
            max-height="300"
            highlight-current-row
            @row-click="handleResultClick"
          >
            <el-table-column prop="title" label="标题" min-width="200" />
            <el-table-column label="难度" width="100">
              <template #default="{ row }">
                <el-tag :type="getDifficultyType(row.difficulty)" size="small">
                  {{ getDifficultyText(row.difficulty) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="已选" width="70">
              <template #default="{ row }">
                <el-icon v-if="isProblemSelected(row.id)" color="#67c23a"><Check /></el-icon>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  size="small"
                  link
                  @click.stop="selectProblem(row)"
                >
                  选择
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 题目详情预览 -->
        <div v-if="previewProblem" class="problem-preview">
          <el-divider />
          <h3 class="preview-title">
            {{ previewProblem.title }}
            <el-tag :type="getDifficultyType(previewProblem.difficulty)" size="small" style="margin-left: 10px">
              {{ getDifficultyText(previewProblem.difficulty) }}
            </el-tag>
          </h3>
          <div class="preview-meta">
            <span>时间限制: {{ previewProblem.timeLimit }}ms</span>
            <span>内存限制: {{ previewProblem.memoryLimit }}MB</span>
            <span>通过: {{ previewProblem.acceptCount }} / 提交: {{ previewProblem.submitCount }}</span>
          </div>

          <el-collapse>
            <el-collapse-item title="题目描述" name="desc">
              <markdown-viewer :content="previewProblem.description || '暂无描述'" />
            </el-collapse-item>
            <el-collapse-item v-if="previewProblem.inputDescription" title="输入说明" name="input-desc">
              <markdown-viewer :content="previewProblem.inputDescription || '无'" />
            </el-collapse-item>
            <el-collapse-item v-if="previewProblem.outputDescription" title="输出说明" name="output-desc">
              <markdown-viewer :content="previewProblem.outputDescription || '无'" />
            </el-collapse-item>
            <el-collapse-item
              v-if="previewProblem.sampleInput || previewProblem.sampleOutput"
              title="样例"
              name="samples"
            >
              <div class="sample-block">
                <div class="sample-item">
                  <h4>输入样例</h4>
                  <pre class="sample-content">{{ previewProblem.sampleInput || '无' }}</pre>
                </div>
                <div class="sample-item">
                  <h4>输出样例</h4>
                  <pre class="sample-content">{{ previewProblem.sampleOutput || '无' }}</pre>
                </div>
              </div>
            </el-collapse-item>
            <el-collapse-item v-if="previewProblem.hint" title="提示" name="hint">
              <markdown-viewer :content="previewProblem.hint || '无'" />
            </el-collapse-item>
          </el-collapse>
        </div>

        <div v-if="!previewProblem && !searchLoading" class="no-preview">
          点击左侧搜索结果查看题目详情
        </div>
      </div>

      <template #footer>
        <el-button @click="searchDialogVisible = false">关闭</el-button>
        <el-button
          type="primary"
          :disabled="!previewProblem || isProblemSelected(previewProblem.id)"
          @click="confirmSelectProblem"
        >
          {{ isProblemSelected(previewProblem?.id || '') ? '已添加' : '确认添加' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Check } from '@element-plus/icons-vue'
import { useProblemSetStore } from '@/stores/problemSet'
import { useProblemStore } from '@/stores/problem'
import MarkdownViewer from '@/components/MarkdownViewer/index.vue'
import type { ProblemSetProblemDTO, ProblemSetSaveDTO } from '@/types/problemSet'
import type { Problem } from '@/types/problem'

interface EditableProblemRelation extends ProblemSetProblemDTO {
  uid: number
  problemTitle?: string
  problemDifficulty?: number
}

const route = useRoute()
const router = useRouter()
const problemSetStore = useProblemSetStore()
const problemStore = useProblemStore()
const problemSetId = computed(() => route.params.id as string | undefined)
const isEdit = computed(() => !!problemSetId.value)
const saving = ref(false)
const nextUid = ref(1)

// 搜索对话框
const searchDialogVisible = ref(false)
const searchKeyword = ref('')
const searchLoading = ref(false)
const searchResults = ref<Problem[]>([])
const previewProblem = ref<Problem | null>(null)

const form = reactive<ProblemSetSaveDTO>({
  title: '',
  description: '',
  status: 1
})

const problemRows = ref<EditableProblemRelation[]>([])

const getDifficultyType = (difficulty: number) => {
  const types: Record<number, string> = { 1: 'success', 2: 'warning', 3: 'danger' }
  return types[difficulty] || 'info'
}

const getDifficultyText = (difficulty: number) => {
  const texts: Record<number, string> = { 1: '简单', 2: '中等', 3: '困难' }
  return texts[difficulty] || '未知'
}

const isProblemSelected = (problemId: string) => {
  return problemRows.value.some((row) => String(row.problemId) === String(problemId))
}

const normalizeProblemRows = (): ProblemSetProblemDTO[] => {
  return problemRows.value
    .filter((row) => String(row.problemId || '').trim())
    .map((row, index) => ({
      problemId: String(row.problemId).trim(),
      sortOrder: Number(row.sortOrder) || index + 1,
      note: row.note?.trim() || undefined
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

const openSearchDialog = () => {
  searchKeyword.value = ''
  searchResults.value = []
  previewProblem.value = null
  searchDialogVisible.value = true
}

const handleProblemSearch = async () => {
  searchLoading.value = true
  previewProblem.value = null
  try {
    await problemStore.fetchProblems({
      pageNum: 1,
      pageSize: 50,
      title: searchKeyword.value || undefined
    })
    searchResults.value = problemStore.problems
  } catch (error) {
    console.error('Failed to search problems:', error)
  } finally {
    searchLoading.value = false
  }
}

const handleResultClick = async (row: Problem) => {
  previewProblem.value = row
  // 加载完整题目详情获取更多信息
  try {
    await problemStore.fetchProblemDetail(row.id)
    if (problemStore.currentProblem) {
      previewProblem.value = problemStore.currentProblem
    }
  } catch {
    // fallback to row data
  }
}

const selectProblem = (row: Problem) => {
  previewProblem.value = row
  // Also try to fetch full detail
  problemStore.fetchProblemDetail(row.id).then(() => {
    if (problemStore.currentProblem) {
      previewProblem.value = problemStore.currentProblem
    }
  })
}

const confirmSelectProblem = () => {
  if (!previewProblem.value) return
  const pid = String(previewProblem.value.id)
  if (isProblemSelected(pid)) {
    ElMessage.warning('该题目已在列表中')
    return
  }
  problemRows.value.push({
    uid: nextUid.value++,
    problemId: pid,
    sortOrder: problemRows.value.length + 1,
    note: '',
    problemTitle: previewProblem.value.title,
    problemDifficulty: previewProblem.value.difficulty
  })
  ElMessage.success(`已添加题目: ${previewProblem.value.title}`)
}

const removeProblemRow = (index: number) => {
  problemRows.value.splice(index, 1)
}

const fillForm = () => {
  const detail = problemSetStore.currentProblemSet
  if (!detail) return
  form.id = detail.id
  form.title = detail.title
  form.description = detail.description || ''
  form.status = detail.status
  problemRows.value = (detail.problems || [])
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    .map((item) => ({
      uid: nextUid.value++,
      problemId: item.problemId,
      sortOrder: item.sortOrder,
      note: item.note || '',
      problemTitle: item.problem?.title || '',
      problemDifficulty: item.problem?.difficulty
    }))
}

const handleSave = async () => {
  if (!form.title.trim()) {
    ElMessage.warning('请输入题单标题')
    return
  }

  saving.value = true
  try {
    const problems = normalizeProblemRows()
    if (isEdit.value && problemSetId.value) {
      const ok = await problemSetStore.editProblemSet({
        id: problemSetId.value,
        title: form.title.trim(),
        description: form.description?.trim(),
        status: form.status
      })
      if (ok) {
        await problemSetStore.replaceProblems(problemSetId.value, problems)
        ElMessage.success('题单已保存')
        router.push(`/problem-set/${problemSetId.value}`)
      }
    } else {
      const created = await problemSetStore.addProblemSet({
        title: form.title.trim(),
        description: form.description?.trim(),
        status: form.status,
        problems
      })
      if (created) {
        ElMessage.success('题单已创建')
        router.push(`/problem-set/${created.id}`)
      }
    }
  } catch (error) {
    console.error('Save problem set failed:', error)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  if (problemSetId.value) {
    await problemSetStore.fetchProblemSetDetail(problemSetId.value)
    fillForm()
  }
})
</script>

<style scoped lang="scss">
.problem-set-edit-container {
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

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 24px 0 14px;

    h3 {
      margin: 0;
      font-size: 16px;
      color: #303133;
    }
  }

  .problem-cell {
    display: flex;
    align-items: center;
    gap: 8px;

    .problem-title {
      font-weight: 500;
    }

    .problem-difficulty-tag {
      flex-shrink: 0;
    }
  }

  .no-problem {
    color: #c0c4cc;
    font-style: italic;
  }
}

.search-problem-dialog {
  .search-bar {
    margin-bottom: 16px;
  }

  .search-results {
    :deep(.el-table__row) {
      cursor: pointer;
    }
  }

  .problem-preview {
    margin-top: 16px;

    .preview-title {
      margin: 0 0 10px 0;
      font-size: 18px;
      display: flex;
      align-items: center;
    }

    .preview-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      color: #909399;
      font-size: 13px;
      margin-bottom: 14px;
    }

    .sample-block {
      display: flex;
      gap: 20px;

      .sample-item {
        flex: 1;
        min-width: 0;

        h4 {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: #606266;
        }

        .sample-content {
          background: #f5f7fa;
          border: 1px solid #e4e7ed;
          border-radius: 4px;
          padding: 12px;
          font-family: 'Courier New', monospace;
          font-size: 13px;
          white-space: pre-wrap;
          word-break: break-all;
          margin: 0;
          max-height: 200px;
          overflow-y: auto;
        }
      }
    }

    :deep(.el-collapse-item__header) {
      font-weight: 500;
    }
  }

  .no-preview {
    margin-top: 40px;
    text-align: center;
    color: #c0c4cc;
    font-size: 14px;
  }
}
</style>
