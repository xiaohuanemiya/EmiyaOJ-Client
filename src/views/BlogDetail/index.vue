<!-- src/views/BlogDetail/index.vue -->
<template>
  <div class="blog-detail-container">
    <div v-loading="blogStore.loading" class="blog-content-wrapper">
      <el-card v-if="blogStore.currentBlog" class="blog-card">
        <template #header>
          <div class="blog-header">
            <div class="header-left">
              <h1 class="blog-title">
                {{ blogStore.currentBlog.title }}
                <el-tag v-if="blogStore.currentBlog.blogType === 1" size="default" type="success" style="margin-left: 12px">
                  题解
                </el-tag>
              </h1>
              <div class="blog-meta">
                <span class="meta-item">
                  <el-icon><User /></el-icon>
                  <span 
                    class="author-link" 
                    @click="handleAuthorClick(blogStore.currentBlog!.userId)"
                  >
                    用户 {{ blogStore.currentBlog.userId }}
                  </span>
                </span>
                <span class="meta-item">
                  <el-icon><Calendar /></el-icon>
                  {{ formatDate(blogStore.currentBlog.createTime) }}
                </span>
                <span v-if="blogStore.currentBlog.updateTime !== blogStore.currentBlog.createTime" class="meta-item">
                  <el-icon><Edit /></el-icon>
                  更新于 {{ formatDate(blogStore.currentBlog.updateTime) }}
                </span>
                <span class="meta-item">
                  <el-icon><View /></el-icon>
                  {{ blogStore.currentBlog.viewCount }} 阅读
                </span>
                <span v-if="blogStore.currentBlog.problemId" class="meta-item">
                  <el-icon><Link /></el-icon>
                  关联题目 #{{ blogStore.currentBlog.problemId }}
                  <template v-if="blogStore.currentBlog.problemTitle">
                    {{ blogStore.currentBlog.problemTitle }}
                  </template>
                </span>
              </div>
            </div>
            <div class="header-right">
              <el-button
                :type="blogStore.currentBlog.liked ? 'warning' : 'default'"
                :icon="Star"
                @click="handleToggleLike"
              >
                {{ blogStore.currentBlog.liked ? '已点赞' : '点赞' }} ({{ blogStore.currentBlog.likeCount }})
              </el-button>
              <el-button
                v-if="isAuthor"
                type="danger"
                :icon="Delete"
                @click="handleDelete"
              >
                删除
              </el-button>
            </div>
          </div>
        </template>

        <!-- 标签 -->
        <div class="blog-tags">
          <el-tag
            v-for="tag in blogStore.currentBlog.tags"
            :key="tag.id"
            size="default"
            type="info"
            style="margin-right: 8px"
          >
            {{ tag.name }}
          </el-tag>
        </div>

        <!-- 博客内容 -->
        <div class="blog-body">
          <MarkdownViewer :content="blogStore.currentBlog.content" />
        </div>

        <!-- 图片附件 -->
        <div v-if="blogStore.currentBlog.pictures && blogStore.currentBlog.pictures.length > 0" class="blog-pictures">
          <h4>相关图片</h4>
          <div class="pictures-grid">
            <el-image
              v-for="pic in blogStore.currentBlog.pictures"
              :key="pic.id"
              :src="pic.url"
              :alt="pic.originalFilename"
              fit="cover"
              class="picture-item"
              :preview-src-list="[pic.url]"
              :initial-index="0"
            />
          </div>
        </div>
      </el-card>

      <el-empty v-else-if="!blogStore.loading" description="博客不存在" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { User, Calendar, Edit, Delete, Star, View, Link } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { useBlogStore } from '@/stores/blog'
import { useAuthStore } from '@/stores/auth'
import { formatDateTime } from '@/utils/format'
import MarkdownViewer from '@/components/MarkdownViewer/index.vue'

const route = useRoute()
const router = useRouter()
const blogStore = useBlogStore()
const authStore = useAuthStore()

const blogId = computed(() => route.params.id as string)

const isAuthor = computed(() => {
  if (!blogStore.currentBlog || !authStore.user) return false
  return blogStore.currentBlog.userId === authStore.user.id
})

const formatDate = (dateStr: string) => {
  return formatDateTime(dateStr)
}

const handleAuthorClick = (userId: string) => {
  router.push(`/blog/user/${userId}`)
}

const handleToggleLike = async () => {
  if (!blogStore.currentBlog) return
  await blogStore.toggleLike(blogId.value, blogStore.currentBlog.liked)
}

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('确定要删除这篇博客吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const success = await blogStore.removeBlog(blogId.value)
    if (success) {
      router.push('/blogs')
    }
  } catch {
    // 用户取消
  }
}

onMounted(async () => {
  await blogStore.fetchBlogDetail(blogId.value)
})

onUnmounted(() => {
  blogStore.clearCurrentBlog()
})
</script>

<style scoped>
.blog-detail-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.blog-card {
  margin-bottom: 20px;
}

.blog-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.header-left {
  flex: 1;
}

.blog-title {
  margin: 0 0 12px 0;
  font-size: 24px;
  color: #303133;
}

.blog-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  color: #909399;
  font-size: 14px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.author-link {
  cursor: pointer;
  color: #409eff;
}

.author-link:hover {
  text-decoration: underline;
}

.header-right {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.blog-tags {
  margin-bottom: 20px;
}

.blog-body {
  line-height: 1.8;
  color: #303133;
}

.blog-pictures {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.blog-pictures h4 {
  margin: 0 0 16px 0;
  color: #303133;
}

.pictures-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}

.picture-item {
  width: 100%;
  height: 150px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  cursor: pointer;
}
</style>
