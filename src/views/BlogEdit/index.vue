<!-- src/views/BlogEdit/index.vue -->
<template>
  <div class="blog-edit-container">
    <el-card v-loading="loading">
      <template #header>
        <div class="header-content">
          <h2>发布博客</h2>
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

        <el-form-item label="类型" prop="blogType">
          <el-radio-group v-model="blogForm.blogType">
            <el-radio :value="0">普通博客</el-radio>
            <el-radio :value="1">题解</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="标签" prop="tagIds">
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
              :value="tag.id"
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
                maxlength="10000"
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

        <!-- 图片上传 -->
        <el-form-item label="图片附件">
          <div class="upload-section">
            <el-upload
              :http-request="handleUploadImage"
              :show-file-list="false"
              accept="image/jpeg,image/png,image/webp,image/gif"
            >
              <el-button type="primary" :loading="uploading">
                上传图片
              </el-button>
            </el-upload>
            <div v-if="uploadedPictures.length > 0" class="uploaded-list">
              <div
                v-for="pic in uploadedPictures"
                :key="pic.id"
                class="uploaded-item"
              >
                <el-image
                  :src="pic.url"
                  fit="cover"
                  style="width: 100px; height: 80px; border-radius: 4px"
                  :preview-src-list="[pic.url]"
                />
                <span class="uploaded-name">{{ pic.originalFilename }}</span>
                <el-button
                  type="danger"
                  size="small"
                  text
                  :icon="Delete"
                  @click="handleRemovePicture(pic.id)"
                />
              </div>
            </div>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            发布博客
          </el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Delete } from '@element-plus/icons-vue'
import type { FormInstance, FormRules, UploadRequestOptions } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useBlogStore } from '@/stores/blog'
import type { BlogPicture } from '@/types/blog'
import MarkdownViewer from '@/components/MarkdownViewer/index.vue'

const router = useRouter()
const blogStore = useBlogStore()

const formRef = ref<FormInstance>()
const loading = ref(false)
const submitting = ref(false)
const uploading = ref(false)
const editorMode = ref<'edit' | 'preview' | 'split'>('edit')

interface BlogFormData {
  title: string
  content: string
  blogType: number
  tagIds: string[]
  pictureIds: string[]
}

const blogForm = reactive<BlogFormData>({
  title: '',
  content: '',
  blogType: 0,
  tagIds: [],
  pictureIds: []
})

const uploadedPictures = ref<BlogPicture[]>([])

const formRules = computed<FormRules<BlogFormData>>(() => ({
  title: [
    { required: true, message: '请输入博客标题', trigger: 'blur' },
    { max: 50, message: '标题不能超过50个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入博客内容', trigger: 'blur' },
    { max: 10000, message: '内容不能超过10000个字符', trigger: 'blur' }
  ],
  blogType: [],
  tagIds: [],
  pictureIds: []
}))

const handleUploadImage = async (options: UploadRequestOptions) => {
  uploading.value = true
  try {
    const picture = await blogStore.addImage(options.file as File)
    if (picture) {
      uploadedPictures.value.push(picture)
      blogForm.pictureIds.push(picture.id)
      ElMessage.success('图片上传成功')
    }
  } finally {
    uploading.value = false
  }
}

const handleRemovePicture = async (picId: string) => {
  const success = await blogStore.removeImage(picId)
  if (success) {
    uploadedPictures.value = uploadedPictures.value.filter((p) => p.id !== picId)
    blogForm.pictureIds = blogForm.pictureIds.filter((id) => id !== picId)
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const success = await blogStore.addBlog({
      title: blogForm.title,
      content: blogForm.content,
      blogType: blogForm.blogType,
      tagIds: blogForm.tagIds,
      pictureIds: blogForm.pictureIds
    })
    
    if (success) {
      router.push('/blogs')
    }
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  router.back()
}

onMounted(() => {
  blogStore.fetchTags()
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

.upload-section {
  width: 100%;
}

.uploaded-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
}

.uploaded-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background: #fafafa;
}

.uploaded-name {
  font-size: 12px;
  color: #606266;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
