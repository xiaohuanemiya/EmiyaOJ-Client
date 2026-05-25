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
                    {{ formatAuthorName(blogStore.currentBlog.authorNickname, blogStore.currentBlog.userId) }}
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
                <span v-if="blogStore.currentBlog.problemId" class="meta-item meta-link" @click="handleProblemClick(blogStore.currentBlog!.problemId!)">
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
                :type="blogStore.currentBlog.liked ? 'danger' : 'default'"
                @click="handleToggleLike"
              >
                <el-icon><Star /></el-icon>
                {{ blogStore.currentBlog.liked ? '已点赞' : '点赞' }} ({{ blogStore.currentBlog.likeCount }})
              </el-button>
              <el-button
                :type="blogStore.isStarred ? 'warning' : 'default'"
                @click="handleToggleStar"
              >
                <el-icon><Collection /></el-icon>
                {{ blogStore.isStarred ? '已收藏' : '收藏' }}
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

    <!-- 评论区 -->
    <el-card v-if="blogStore.currentBlog" class="comments-card">
      <template #header>
        <div class="comments-header">
          <h3>评论 ({{ blogStore.commentsTotal }})</h3>
        </div>
      </template>

      <!-- 发表评论 -->
      <div class="comment-form">
        <el-input
          v-model="newComment"
          type="textarea"
          :rows="3"
          placeholder="写下你的评论..."
          maxlength="200"
          show-word-limit
        />
        <el-button
          type="primary"
          style="margin-top: 12px"
          :disabled="!newComment.trim()"
          @click="handleSubmitComment"
        >
          发表评论
        </el-button>
      </div>

      <!-- 评论列表 -->
      <div v-loading="blogStore.commentsLoading" class="comment-list">
        <el-empty v-if="blogStore.comments.length === 0" description="暂无评论" />
        
        <div
          v-for="comment in blogStore.comments"
          :key="comment.id"
          class="comment-item"
        >
          <div class="comment-header">
            <div class="comment-user">
              <el-avatar :size="36">{{ comment.nickname?.charAt(0) || comment.username?.charAt(0) || 'U' }}</el-avatar>
              <div class="user-info">
                <span class="username">{{ comment.nickname || comment.username }}</span>
                <span class="comment-time">{{ formatDate(comment.createTime) }}</span>
              </div>
            </div>
            <el-button
              v-if="canDeleteComment(comment)"
              type="danger"
              text
              size="small"
              :icon="Delete"
              @click="handleDeleteComment(comment.id)"
            >
              删除
            </el-button>
          </div>
          <div class="comment-content">{{ comment.content }}</div>
        </div>
      </div>

      <!-- 评论分页 -->
      <div v-if="blogStore.commentsTotal > 0" class="comment-pagination">
        <el-pagination
          v-model:current-page="commentParams.pageNo"
          v-model:page-size="commentParams.pageSize"
          :total="blogStore.commentsTotal"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @current-change="handleCommentPageChange"
          @size-change="handleCommentSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { User, Calendar, Edit, Delete, Star, View, Link, Collection } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { useBlogStore } from '@/stores/blog'
import { useAuthStore } from '@/stores/auth'
import { formatDateTime } from '@/utils/format'
import type { CommentQueryParams } from '@/types/blog'
import type { Comment } from '@/types/blog'
import MarkdownViewer from '@/components/MarkdownViewer/index.vue'

const route = useRoute()
const router = useRouter()
const blogStore = useBlogStore()
const authStore = useAuthStore()

const blogId = computed(() => route.params.id as string)
const newComment = ref('')

const commentParams = reactive<CommentQueryParams>({
  pageNo: 1,
  pageSize: 10
})

const isAuthor = computed(() => {
  if (!blogStore.currentBlog || !authStore.user) return false
  return blogStore.currentBlog.userId === authStore.user.id
})

const formatDate = (dateStr: string) => {
  return formatDateTime(dateStr)
}

const formatAuthorName = (nickname: string | undefined, userId: string) => {
  const trimmed = nickname?.trim()
  return trimmed || `用户 ${userId}`
}

const handleAuthorClick = (userId: string) => {
  router.push(`/user/${userId}`)
}

const handleProblemClick = (problemId: string) => {
  router.push(`/problem/${problemId}`)
}

// 点赞
const handleToggleLike = async () => {
  if (!blogStore.currentBlog) return
  await blogStore.toggleLike(blogId.value, blogStore.currentBlog.liked)
}

// 收藏
const handleToggleStar = async () => {
  await blogStore.toggleStar(blogId.value)
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

// 评论相关
const handleSubmitComment = async () => {
  if (!newComment.value.trim()) return
  
  const success = await blogStore.addComment(blogId.value, {
    content: newComment.value.trim()
  })
  
  if (success) {
    newComment.value = ''
    commentParams.pageNo = 1
    blogStore.fetchComments(blogId.value, commentParams)
  }
}

const handleCommentPageChange = () => {
  blogStore.fetchComments(blogId.value, commentParams)
}

const handleCommentSizeChange = () => {
  commentParams.pageNo = 1
  blogStore.fetchComments(blogId.value, commentParams)
}

const canDeleteComment = (comment: Comment) => {
  if (!authStore.user) return false
  return comment.userId === authStore.user.id || isAuthor.value
}

const handleDeleteComment = async (commentId: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const success = await blogStore.removeComment(commentId)
    if (success) {
      blogStore.fetchComments(blogId.value, commentParams)
    }
  } catch {
    // 用户取消
  }
}

onMounted(async () => {
  await blogStore.fetchBlogDetail(blogId.value)
  if (blogStore.currentBlog) {
    blogStore.fetchComments(blogId.value, commentParams)
  }
})

onUnmounted(() => {
  blogStore.clearCurrentBlog()
  blogStore.clearComments()
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

.meta-link {
  cursor: pointer;
  color: #409eff;
}

.meta-link:hover {
  text-decoration: underline;
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

.comments-card {
  margin-top: 20px;
}

.comments-header h3 {
  margin: 0;
}

.comment-form {
  padding-bottom: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.comment-list {
  min-height: 200px;
}

.comment-item {
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.comment-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: 500;
  color: #303133;
}

.comment-time {
  font-size: 12px;
  color: #909399;
}

.comment-content {
  padding-left: 48px;
  color: #606266;
  line-height: 1.6;
  word-break: break-word;
}

.comment-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
