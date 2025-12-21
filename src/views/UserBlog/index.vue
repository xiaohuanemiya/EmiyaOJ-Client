<!-- src/views/UserBlog/index.vue -->
<template>
  <div class="user-blog-container">
    <!-- 用户信息卡片 -->
    <el-card class="user-info-card">
      <div v-loading="userInfoLoading" class="user-info">
        <el-avatar :size="80" class="user-avatar">
          {{ userInfo?.nickname?.charAt(0) || userInfo?.username?.charAt(0) || 'U' }}
        </el-avatar>
        <div class="user-details">
          <h2 class="user-name">{{ userInfo?.nickname || userInfo?.username || '用户' }}</h2>
          <p class="user-username">@{{ userInfo?.username || userId }}</p>
          <div class="user-stats">
            <div class="stat-item">
              <span class="stat-value">{{ userInfo?.blogCount || 0 }}</span>
              <span class="stat-label">博客</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ userInfo?.starCount || 0 }}</span>
              <span class="stat-label">收藏</span>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 博客列表 -->
    <el-card class="blog-list-card">
      <template #header>
        <div class="card-header">
          <el-tabs v-model="activeTab" @tab-change="handleTabChange">
            <el-tab-pane label="发布的博客" name="blogs" />
            <el-tab-pane label="收藏的博客" name="stars" />
          </el-tabs>
        </div>
      </template>

      <div v-loading="blogStore.loading" class="blog-list">
        <el-empty 
          v-if="currentBlogs.length === 0" 
          :description="activeTab === 'blogs' ? '暂无发布的博客' : '暂无收藏的博客'" 
        />
        
        <div
          v-for="blog in currentBlogs"
          :key="blog.id"
          class="blog-item"
          @click="handleBlogClick(blog)"
        >
          <div class="blog-header">
            <h3 class="blog-title">{{ blog.title }}</h3>
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
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="currentTotal > 0" class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.pageNo"
          v-model:page-size="queryParams.pageSize"
          :total="currentTotal"
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
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Calendar } from '@element-plus/icons-vue'
import { useBlogStore } from '@/stores/blog'
import type { Blog, UserBlogQueryParams } from '@/types/blog'
import { formatDateTime } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const blogStore = useBlogStore()

const userId = computed(() => route.params.uid as string)
const activeTab = ref<'blogs' | 'stars'>('blogs')
const userInfoLoading = ref(false)

const userInfo = computed(() => blogStore.userBlogInfo)

const queryParams = reactive<UserBlogQueryParams>({
  pageNo: 1,
  pageSize: 10
})

const currentBlogs = computed(() => {
  return activeTab.value === 'blogs' 
    ? blogStore.userBlogs 
    : blogStore.userStarredBlogs
})

const currentTotal = computed(() => {
  return activeTab.value === 'blogs' 
    ? blogStore.userBlogsTotal 
    : blogStore.userStarredTotal
})

const handleTabChange = () => {
  queryParams.pageNo = 1
  fetchBlogs()
}

const handlePageChange = () => {
  fetchBlogs()
}

const handleSizeChange = () => {
  queryParams.pageNo = 1
  fetchBlogs()
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

const fetchUserInfo = async () => {
  userInfoLoading.value = true
  try {
    await blogStore.fetchUserBlogInfo(userId.value)
  } finally {
    userInfoLoading.value = false
  }
}

const fetchBlogs = () => {
  if (activeTab.value === 'blogs') {
    blogStore.fetchUserBlogs(userId.value, queryParams)
  } else {
    blogStore.fetchUserStarredBlogs(userId.value, queryParams)
  }
}

// 监听 userId 变化
watch(userId, () => {
  queryParams.pageNo = 1
  activeTab.value = 'blogs'
  fetchUserInfo()
  fetchBlogs()
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
  margin: 0 0 16px 0;
  color: #909399;
  font-size: 14px;
}

.user-stats {
  display: flex;
  gap: 32px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.blog-list-card {
  margin-bottom: 20px;
}

.card-header {
  margin: -12px 0;
}

.card-header :deep(.el-tabs__header) {
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
