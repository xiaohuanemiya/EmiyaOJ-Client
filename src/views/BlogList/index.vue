<!-- src/views/BlogList/index.vue -->
<template>
  <div class="blog-list-container">
    <el-card>
      <template #header>
        <div class="header-content">
          <h2>博客列表</h2>
          <div class="header-actions">
            <el-input
              v-model="queryParams.title"
              placeholder="搜索博客..."
              style="width: 300px; margin-right: 12px"
              clearable
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            >
              <template #append>
                <el-button :icon="Search" @click="handleSearch" />
              </template>
            </el-input>
            <el-button type="primary" :icon="Plus" @click="handleCreate">
              发布博客
            </el-button>
          </div>
        </div>
      </template>

      <!-- 筛选条件 -->
      <div class="filter-bar">
        <el-space wrap>
          <span>发布日期：</span>
          <el-date-picker
            v-model="queryParams.createTime"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DDTHH:mm:ss"
            clearable
            @change="handleSearch"
          />
        </el-space>
      </div>

      <!-- 博客列表 -->
      <div v-loading="blogStore.loading" class="blog-list">
        <el-empty v-if="blogStore.blogs.length === 0" description="暂无博客" />
        
        <div
          v-for="blog in blogStore.blogs"
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
            <span class="blog-author">
              <el-icon><User /></el-icon>
              用户 {{ blog.userId }}
            </span>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.pageNo"
          v-model:page-size="queryParams.pageSize"
          :total="blogStore.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Plus, Calendar, User } from '@element-plus/icons-vue'
import { useBlogStore } from '@/stores/blog'
import type { BlogQueryParams } from '@/types/blog'
import type { Blog } from '@/types/blog'
import { formatDateTime } from '@/utils/format'

const router = useRouter()
const blogStore = useBlogStore()

const queryParams = reactive<BlogQueryParams>({
  pageNo: 1,
  pageSize: 10,
  title: '',
  createTime: undefined
})

const handleSearch = () => {
  queryParams.pageNo = 1
  blogStore.fetchBlogs(queryParams)
}

const handlePageChange = () => {
  blogStore.fetchBlogs(queryParams)
}

const handleSizeChange = () => {
  queryParams.pageNo = 1
  blogStore.fetchBlogs(queryParams)
}

const handleCreate = () => {
  router.push('/blog/create')
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

onMounted(() => {
  blogStore.fetchBlogs(queryParams)
})
</script>

<style scoped>
.blog-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h2 {
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
}

.filter-bar {
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.blog-list {
  min-height: 400px;
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
