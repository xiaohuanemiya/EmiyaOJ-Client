<!-- src/views/UserBlog/index.vue -->
<template>
  <div class="user-blog-container">
    <!-- 用户信息卡片 -->
    <el-card class="user-info-card">
      <div class="user-info">
        <el-avatar :size="80" class="user-avatar">
          {{ userId?.charAt(0) || 'U' }}
        </el-avatar>
        <div class="user-details">
          <h2 class="user-name">用户 {{ userId }}</h2>
          <p class="user-username">@{{ userId }}</p>
        </div>
      </div>
    </el-card>

    <!-- 博客列表 -->
    <el-card class="blog-list-card">
      <template #header>
        <div class="card-header">
          <h3>发布的博客</h3>
        </div>
      </template>

      <div v-loading="blogStore.loading" class="blog-list">
        <el-empty 
          v-if="blogStore.blogs.length === 0" 
          description="暂无博客" 
        />
        
        <div
          v-for="blog in blogStore.blogs"
          :key="blog.id"
          class="blog-item"
          @click="handleBlogClick(blog)"
        >
          <div class="blog-header">
            <h3 class="blog-title">
              {{ blog.title }}
              <el-tag v-if="blog.blogType === 1" size="small" type="success" style="margin-left: 8px">
                题解
              </el-tag>
            </h3>
            <div class="blog-tags">
              <el-tag
                v-for="tag in blog.tags"
                :key="tag.id"
                size="small"
                type="info"
                style="margin-right: 8px"
              >
                {{ tag.name }}
              </el-tag>
            </div>
          </div>
          <p class="blog-content">{{ truncateContent(blog.content) }}</p>
          <div class="blog-footer">
            <span class="blog-time">
              <el-icon><Calendar /></el-icon>
              {{ formatDate(blog.createTime) }}
            </span>
            <span class="blog-stats">
              <span class="stat-item">
                <el-icon><View /></el-icon>
                {{ blog.viewCount }}
              </span>
              <span class="stat-item">
                <el-icon><Star /></el-icon>
                {{ blog.likeCount }}
              </span>
            </span>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="blogStore.total > 0" class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.pageNo"
          v-model:page-size="queryParams.pageSize"
          :total="blogStore.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Calendar, View, Star } from '@element-plus/icons-vue'
import { useBlogStore } from '@/stores/blog'
import type { Blog, BlogQueryParams } from '@/types/blog'
import { formatDateTime } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const blogStore = useBlogStore()

const userId = computed(() => route.params.uid as string)

const queryParams = reactive<BlogQueryParams>({
  pageNo: 1,
  pageSize: 10
})

const handlePageChange = () => {
  blogStore.fetchBlogs(queryParams)
}

const handleSizeChange = () => {
  queryParams.pageNo = 1
  blogStore.fetchBlogs(queryParams)
}

const handleBlogClick = (blog: Blog) => {
  router.push(`/blog/${blog.id}`)
}

const truncateContent = (content: string) => {
  const maxLength = 200
  if (content.length > maxLength) {
    return content.substring(0, maxLength) + '...'
  }
  return content
}

const formatDate = (dateStr: string) => {
  return formatDateTime(dateStr)
}

// 监听 userId 变化
watch(userId, () => {
  queryParams.pageNo = 1
  blogStore.fetchBlogs(queryParams)
})

onMounted(() => {
  blogStore.fetchBlogs(queryParams)
})

onMounted(() => {
  fetchUserInfo()
  fetchBlogs()
})
</script>

<style scoped>
.user-blog-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.user-info-card {
  margin-bottom: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 20px;
}

.user-avatar {
  background-color: #409eff;
  color: #fff;
  font-size: 32px;
  flex-shrink: 0;
}

.user-details {
  flex: 1;
}

.user-name {
  margin: 0 0 4px 0;
  font-size: 24px;
  color: #303133;
}

.user-username {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.blog-list-card {
  margin-bottom: 20px;
}

.card-header h3 {
  margin: 0;
}

.blog-list {
  min-height: 300px;
}

.blog-item {
  padding: 20px;
  margin-bottom: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.blog-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.2);
}

.blog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.blog-title {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.blog-content {
  margin: 0 0 12px 0;
  color: #606266;
  line-height: 1.6;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.blog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #909399;
}

.blog-stats {
  display: flex;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>

.blog-item:last-child {
  margin-bottom: 0;
}

.blog-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.blog-title {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.blog-tags {
  flex-shrink: 0;
}

.blog-content {
  margin: 0 0 12px 0;
  color: #606266;
  line-height: 1.6;
  word-break: break-word;
}

.blog-footer {
  display: flex;
  gap: 20px;
  color: #909399;
  font-size: 14px;
}

.blog-footer span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
