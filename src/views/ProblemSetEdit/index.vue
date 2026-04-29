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
        <el-button type="primary" plain @click="addProblemRow">添加题目</el-button>
      </div>

      <el-table :data="problemRows" border style="width: 100%">
        <el-table-column label="题目ID" min-width="160">
          <template #default="{ row }">
            <el-input v-model="row.problemId" placeholder="problemId" />
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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useProblemSetStore } from '@/stores/problemSet'
import type { ProblemSetProblemDTO, ProblemSetSaveDTO } from '@/types/problemSet'

interface EditableProblemRelation extends ProblemSetProblemDTO {
  uid: number
}

const route = useRoute()
const router = useRouter()
const problemSetStore = useProblemSetStore()
const problemSetId = computed(() => route.params.id as string | undefined)
const isEdit = computed(() => !!problemSetId.value)
const saving = ref(false)
const nextUid = ref(1)

const form = reactive<ProblemSetSaveDTO>({
  title: '',
  description: '',
  status: 1
})

const problemRows = ref<EditableProblemRelation[]>([])

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

const addProblemRow = () => {
  problemRows.value.push({
    uid: nextUid.value++,
    problemId: '',
    sortOrder: problemRows.value.length + 1,
    note: ''
  })
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
      note: item.note || ''
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
  } else {
    addProblemRow()
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
}
</style>
