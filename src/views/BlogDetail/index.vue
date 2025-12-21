<!-- src/views/BlogDetail/index.vue -->
<template>
  <div class="blog-detail-container">
    <div v-loading="blogStore.loading" class="blog-content-wrapper">
      <el-card v-if="blogStore.currentBlog" class="blog-card">
        <template #header>
          <div class="blog-header">
            <div class="header-left">
              <h1 class="blog-title">{{ blogStore.currentBlog.title }}</h1>
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
              </div>
            </div>
            <div class="header-right">
              <el-button
                :type="isStarred ? 'warning' : 'default'"
                :icon="Star"
                @click="handleToggleStar"
              >
                {{ isStarred ? '已收藏' : '收藏' }}
              </el-button>
              <el-button
                v-if="isAuthor"
                type="primary"
                :icon="Edit"
                @click="handleEdit"
              >
                编辑
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

      <!-- 评论排序 -->
      <div class="comment-sort">
        <el-radio-group v-model="commentSort" @change="handleSortChange">
          <el-radio-button value="newest">最新</el-radio-button>
          <el-radio-button value="oldest">最早</el-radio-button>
        </el-radio-group>
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
import { User, Calendar, Edit, Delete, Star } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
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
const isStarred = ref(false)
const newComment = ref('')
const commentSort = ref<'newest' | 'oldest'>('newest')

const commentParams = reactive<CommentQueryParams>({
  pageNo: 1,
  pageSize: 10,
  sortBy: 'create_time',
  isAsc: false
})

const isAuthor = computed(() => {
  if (!blogStore.currentBlog || !authStore.user) return false
  return blogStore.currentBlog.userId === String(authStore.user.id)
})

const formatDate = (dateStr: string) => {
  return formatDateTime(dateStr)
}

const handleAuthorClick = (userId: string) => {
  router.push(`/blog/user/${userId}`)
}

const handleToggleStar = async () => {
  const success = await blogStore.toggleStar(blogId.value, isStarred.value)
  if (success) {
    isStarred.value = !isStarred.value
  }
}

const handleEdit = () => {
  router.push(`/blog/edit/${blogId.value}`)
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

const handleSubmitComment = async () => {
  if (!newComment.value.trim()) return
  
  const success = await blogStore.addComment(blogId.value, {
    content: newComment.value.trim()
  })
  
  if (success) {
    newComment.value = ''
    // 刷新评论列表
    commentParams.pageNo = 1
    blogStore.fetchComments(blogId.value, commentParams)
  }
}

const handleSortChange = () => {
  commentParams.isAsc = commentSort.value === 'oldest'
  commentParams.pageNo = 1
  blogStore.fetchComments(blogId.value, commentParams)
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
  // 评论作者或博客作者可以删除评论
  return comment.userId === String(authStore.user.id) || isAuthor.value
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

.comment-sort {
  padding: 16px 0;
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
