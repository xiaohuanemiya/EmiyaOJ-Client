// src/stores/blog.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Blog, BlogTag, Comment, UserBlogInfo, BlogQueryParams, CommentQueryParams, UserBlogQueryParams } from '@/types/blog'
import {
  getAllBlogs,
  queryBlogs,
  getBlogDetail,
  deleteBlog,
  createBlog,
  updateBlog,
  getAllTags,
  queryBlogComments,
  createComment,
  deleteComment,
  starBlog,
  unstarBlog,
  getUserBlogInfo,
  queryUserBlogs,
  queryUserStarredBlogs
} from '@/api/blog'
import type { CreateBlogParams, UpdateBlogParams, CreateCommentParams } from '@/types/blog'
import { ElMessage } from 'element-plus'

export const useBlogStore = defineStore('blog', () => {
  // State
  const blogs = ref<Blog[]>([])
  const currentBlog = ref<Blog | null>(null)
  const total = ref(0)
  const pages = ref(0)
  const loading = ref(false)

  // Tags state
  const tags = ref<BlogTag[]>([])
  const tagsLoading = ref(false)

  // Comments state
  const comments = ref<Comment[]>([])
  const commentsTotal = ref(0)
  const commentsPages = ref(0)
  const commentsLoading = ref(false)

  // User blog state
  const userBlogInfo = ref<UserBlogInfo | null>(null)
  const userBlogs = ref<Blog[]>([])
  const userBlogsTotal = ref(0)
  const userBlogsPages = ref(0)
  const userStarredBlogs = ref<Blog[]>([])
  const userStarredTotal = ref(0)
  const userStarredPages = ref(0)

  // Actions - 博客相关
  const fetchAllBlogs = async () => {
    loading.value = true
    try {
      const response = await getAllBlogs()
      if (response.code === 200 && response.data) {
        blogs.value = response.data
      }
    } catch (error) {
      console.error('Failed to fetch all blogs:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchBlogs = async (params: BlogQueryParams) => {
    loading.value = true
    try {
      const response = await queryBlogs(params)
      if (response.code === 200 && response.data) {
        blogs.value = response.data.list
        total.value = response.data.total
        pages.value = response.data.pages
      }
    } catch (error) {
      console.error('Failed to fetch blogs:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchBlogDetail = async (id: string | number) => {
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

  const editBlog = async (id: string | number, params: UpdateBlogParams) => {
    try {
      const response = await updateBlog(id, params)
      if (response.code === 200) {
        ElMessage.success('修改成功')
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to update blog:', error)
      return false
    }
  }

  const removeBlog = async (id: string | number) => {
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

  // Actions - 标签相关
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

  // Actions - 评论相关
  const fetchComments = async (blogId: string | number, params: CommentQueryParams) => {
    commentsLoading.value = true
    try {
      const response = await queryBlogComments(blogId, params)
      if (response.code === 200 && response.data) {
        comments.value = response.data.list
        commentsTotal.value = response.data.total
        commentsPages.value = response.data.pages
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    } finally {
      commentsLoading.value = false
    }
  }

  const addComment = async (blogId: string | number, params: CreateCommentParams) => {
    try {
      const response = await createComment(blogId, params)
      if (response.code === 200) {
        ElMessage.success('评论成功')
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to create comment:', error)
      return false
    }
  }

  const removeComment = async (commentId: string | number) => {
    try {
      const response = await deleteComment(commentId)
      if (response.code === 200) {
        ElMessage.success('删除成功')
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to delete comment:', error)
      return false
    }
  }

  // Actions - 收藏相关
  const toggleStar = async (blogId: string | number, isStarred: boolean) => {
    try {
      const response = isStarred ? await unstarBlog(blogId) : await starBlog(blogId)
      if (response.code === 200) {
        ElMessage.success(isStarred ? '已取消收藏' : '收藏成功')
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to toggle star:', error)
      return false
    }
  }

  // Actions - 用户博客相关
  const fetchUserBlogInfo = async (userId: string | number) => {
    try {
      const response = await getUserBlogInfo(userId)
      if (response.code === 200 && response.data) {
        userBlogInfo.value = response.data
        return response.data
      }
      return null
    } catch (error) {
      console.error('Failed to fetch user blog info:', error)
      return null
    }
  }

  const fetchUserBlogs = async (userId: string | number, params: UserBlogQueryParams) => {
    loading.value = true
    try {
      const response = await queryUserBlogs(userId, params)
      if (response.code === 200 && response.data) {
        userBlogs.value = response.data.list
        userBlogsTotal.value = response.data.total
        userBlogsPages.value = response.data.pages
      }
    } catch (error) {
      console.error('Failed to fetch user blogs:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchUserStarredBlogs = async (userId: string | number, params: UserBlogQueryParams) => {
    loading.value = true
    try {
      const response = await queryUserStarredBlogs(userId, params)
      if (response.code === 200 && response.data) {
        userStarredBlogs.value = response.data.list
        userStarredTotal.value = response.data.total
        userStarredPages.value = response.data.pages
      }
    } catch (error) {
      console.error('Failed to fetch user starred blogs:', error)
    } finally {
      loading.value = false
    }
  }

  // 清空当前博客
  const clearCurrentBlog = () => {
    currentBlog.value = null
  }

  // 清空评论
  const clearComments = () => {
    comments.value = []
    commentsTotal.value = 0
    commentsPages.value = 0
  }

  return {
    // State
    blogs,
    currentBlog,
    total,
    pages,
    loading,
    tags,
    tagsLoading,
    comments,
    commentsTotal,
    commentsPages,
    commentsLoading,
    userBlogInfo,
    userBlogs,
    userBlogsTotal,
    userBlogsPages,
    userStarredBlogs,
    userStarredTotal,
    userStarredPages,

    // Actions
    fetchAllBlogs,
    fetchBlogs,
    fetchBlogDetail,
    addBlog,
    editBlog,
    removeBlog,
    fetchTags,
    fetchComments,
    addComment,
    removeComment,
    toggleStar,
    fetchUserBlogInfo,
    fetchUserBlogs,
    fetchUserStarredBlogs,
    clearCurrentBlog,
    clearComments
  }
})
