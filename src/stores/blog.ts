// src/stores/blog.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Blog, BlogTag, BlogPicture, BlogQueryParams } from '@/types/blog'
import {
  queryBlogs,
  getBlogDetail,
  deleteBlog,
  createBlog,
  likeBlog,
  unlikeBlog,
  getAllTags,
  uploadImage,
  deleteImage
} from '@/api/blog'
import type { CreateBlogParams } from '@/types/blog'
import { ElMessage } from 'element-plus'

export const useBlogStore = defineStore('blog', () => {
  // State - 博客
  const blogs = ref<Blog[]>([])
  const currentBlog = ref<Blog | null>(null)
  const total = ref(0)
  const loading = ref(false)

  // State - 标签
  const tags = ref<BlogTag[]>([])
  const tagsLoading = ref(false)

  // State - 题解
  const solutions = ref<Blog[]>([])
  const solutionsTotal = ref(0)
  const solutionsLoading = ref(false)

  // Actions - 博客查询
  const fetchBlogs = async (params: BlogQueryParams) => {
    loading.value = true
    try {
      const response = await queryBlogs(params)
      if (response.code === 200 && response.data) {
        blogs.value = response.data.list
        total.value = response.data.total
      }
    } catch (error) {
      console.error('Failed to fetch blogs:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchBlogDetail = async (id: string) => {
    loading.value = true
    try {
      const response = await getBlogDetail(id)
      if (response.code === 200 && response.data) {
        currentBlog.value = response.data
        return response.data
      }
      return null
    } catch (error) {
      console.error('Failed to fetch blog detail:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  const addBlog = async (params: CreateBlogParams) => {
    try {
      const response = await createBlog(params)
      if (response.code === 200) {
        ElMessage.success('发布成功')
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to create blog:', error)
      return false
    }
  }

  const removeBlog = async (id: string) => {
    try {
      const response = await deleteBlog(id)
      if (response.code === 200) {
        ElMessage.success('删除成功')
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to delete blog:', error)
      return false
    }
  }

  // Actions - 点赞
  const toggleLike = async (blogId: string, isLiked: boolean) => {
    try {
      const response = isLiked ? await unlikeBlog(blogId) : await likeBlog(blogId)
      if (response.code === 200) {
        ElMessage.success(isLiked ? '已取消点赞' : '点赞成功')
        // 更新本地状态
        if (currentBlog.value && currentBlog.value.id === blogId) {
          currentBlog.value.liked = !isLiked
          currentBlog.value.likeCount += isLiked ? -1 : 1
        }
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to toggle like:', error)
      return false
    }
  }

  // Actions - 标签
  const fetchTags = async () => {
    tagsLoading.value = true
    try {
      const response = await getAllTags()
      if (response.code === 200 && response.data) {
        tags.value = response.data
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error)
    } finally {
      tagsLoading.value = false
    }
  }

  // Actions - 图片
  const addImage = async (file: File): Promise<BlogPicture | null> => {
    try {
      const response = await uploadImage(file)
      if (response.code === 200 && response.data) {
        return response.data
      }
      return null
    } catch (error) {
      console.error('Failed to upload image:', error)
      return null
    }
  }

  const removeImage = async (id: string) => {
    try {
      const response = await deleteImage(id)
      if (response.code === 200) {
        ElMessage.success('图片已删除')
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to delete image:', error)
      return false
    }
  }

  // 清空当前博客
  const clearCurrentBlog = () => {
    currentBlog.value = null
  }

  return {
    // State
    blogs,
    currentBlog,
    total,
    loading,
    tags,
    tagsLoading,
    solutions,
    solutionsTotal,
    solutionsLoading,

    // Actions
    fetchBlogs,
    fetchBlogDetail,
    addBlog,
    removeBlog,
    toggleLike,
    fetchTags,
    addImage,
    removeImage,
    clearCurrentBlog
  }
})