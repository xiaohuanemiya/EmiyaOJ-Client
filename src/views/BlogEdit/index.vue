<!-- src/views/BlogEdit/index.vue -->
<template>
  <div class="blog-edit-container">
    <el-card v-loading="loading">
      <template #header>
        <div class="header-content">
          <h2>{{ isEdit ? '编辑博客' : '发布博客' }}</h2>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="blogForm"
        :rules="formRules"
        label-width="80px"
        label-position="top"
      >
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="blogForm.title"
            placeholder="请输入博客标题"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item v-if="!isEdit" label="标签" prop="tagIds">
          <el-select
            v-model="blogForm.tagIds"
            multiple
            placeholder="请选择标签"
            style="width: 100%"
            :loading="blogStore.tagsLoading"
          >
            <el-option
              v-for="tag in blogStore.tags"
              :key="tag.id"
              :label="tag.name"
              :value="Number(tag.id)"
            >
              <span>{{ tag.name }}</span>
              <span style="color: #909399; font-size: 12px; margin-left: 8px">
                {{ tag.desc }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="内容" prop="content">
          <div class="editor-tabs">
            <el-radio-group v-model="editorMode" size="small">
              <el-radio-button value="edit">编辑</el-radio-button>
              <el-radio-button value="preview">预览</el-radio-button>
              <el-radio-button value="split">分屏</el-radio-button>
            </el-radio-group>
          </div>

          <div class="editor-container" :class="{ 'split-mode': editorMode === 'split' }">
            <div v-show="editorMode !== 'preview'" class="editor-pane">
              <el-input
                v-model="blogForm.content"
                type="textarea"
                :rows="20"
                placeholder="请输入博客内容（支持 Markdown 格式）"
                :maxlength="isEdit ? 10000 : 1000"
                show-word-limit
              />
            </div>
            <div v-show="editorMode !== 'edit'" class="preview-pane">
              <div class="preview-content">
                <MarkdownViewer :content="blogForm.content" />
              </div>
            </div>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            {{ isEdit ? '保存修改' : '发布博客' }}
          </el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { useBlogStore } from '@/stores/blog'
import MarkdownViewer from '@/components/MarkdownViewer/index.vue'

const route = useRoute()
const router = useRouter()
const blogStore = useBlogStore()

const formRef = ref<FormInstance>()
const loading = ref(false)
const submitting = ref(false)
const editorMode = ref<'edit' | 'preview' | 'split'>('edit')

const isEdit = computed(() => route.name === 'BlogEdit')
const blogId = computed(() => route.params.id as string)

interface BlogFormData {
  title: string
  content: string
  tagIds: number[]
}

const blogForm = reactive<BlogFormData>({
  title: '',
  content: '',
  tagIds: []
})

const formRules = computed<FormRules<BlogFormData>>(() => ({
  title: [
    { required: true, message: '请输入博客标题', trigger: 'blur' },
    { max: 50, message: '标题不能超过50个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入博客内容', trigger: 'blur' },
    { 
      max: isEdit.value ? 10000 : 1000, 
      message: `内容不能超过${isEdit.value ? 10000 : 1000}个字符`, 
      trigger: 'blur' 
    }
  ],
  tagIds: isEdit.value ? [] : [
    { 
      required: true, 
      message: '请选择至少一个标签', 
      trigger: 'change',
      type: 'array',
      min: 1
    }
  ]
}))

const handleSubmit = async () => {
  if (!formRef.value) return
  
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    let success = false
    
    if (isEdit.value) {
      success = await blogStore.editBlog(blogId.value, {
        title: blogForm.title,
        content: blogForm.content
      })
    } else {
      success = await blogStore.addBlog({
        title: blogForm.title,
        content: blogForm.content,
        tagIds: blogForm.tagIds
      })
    }
    
    if (success) {
      if (isEdit.value) {
        router.push(`/blog/${blogId.value}`)
      } else {
        router.push('/blogs')
      }
    }
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  router.back()
}

const loadBlogDetail = async () => {
  if (!isEdit.value) return
  
  loading.value = true
  try {
    const blog = await blogStore.fetchBlogDetail(blogId.value)
    if (blog) {
      blogForm.title = blog.title
      blogForm.content = blog.content
    }
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  // 加载标签列表
  if (!isEdit.value) {
    blogStore.fetchTags()
  }
  
  // 如果是编辑模式，加载博客详情
  if (isEdit.value) {
    await loadBlogDetail()
  }
})
</script>

<style scoped>
.blog-edit-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.header-content h2 {
  margin: 0;
}

.editor-tabs {
  margin-bottom: 12px;
}

.editor-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.editor-container.split-mode {
  display: flex;
}

.split-mode .editor-pane,
.split-mode .preview-pane {
  flex: 1;
  min-width: 0;
}

.split-mode .preview-pane {
  border-left: 1px solid #dcdfe6;
}

.editor-pane :deep(.el-textarea__inner) {
  border: none;
  border-radius: 0;
  resize: none;
}

.preview-pane {
  background-color: #fafafa;
}

.preview-content {
  padding: 16px;
  min-height: 400px;
  max-height: 500px;
  overflow-y: auto;
}
</style>
