// src/stores/blog.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Blog, BlogTag, BlogPicture, BlogQueryParams, Comment, UserBlogInfo, CommentQueryParams, UserBlogQueryParams, UserLikeQueryParams, UserStarQueryParams } from '@/types/blog'
import {
  queryBlogs,
  getBlogDetail,
  deleteBlog,
  createBlog,
  createSolution,
  querySolutions,
  likeBlog,
  unlikeBlog,
  starBlog,
  unstarBlog,
  getAllTags,
  uploadImage,
  deleteImage,
  queryBlogComments,
  createComment,
  deleteComment,
  getUserBlogInfo,
  queryUserBlogs,
  queryUserLikedBlogs,
  queryUserStarredBlogs
} from '@/api/blog'
import type { CreateBlogParams, CreateCommentParams, SolutionQueryParams } from '@/types/blog'
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

  // State - 收藏（本地跟踪）
  const isStarred = ref(false)

  // State - 评论
  const comments = ref<Comment[]>([])
  const commentsTotal = ref(0)
  const commentsLoading = ref(false)

  // State - 用户博客
  const userBlogInfo = ref<UserBlogInfo | null>(null)
  const userBlogs = ref<Blog[]>([])
  const userBlogsTotal = ref(0)
  const userStarredBlogs = ref<Blog[]>([])
  const userStarredTotal = ref(0)
  const userLikedBlogs = ref<Blog[]>([])
  const userLikedTotal = ref(0)

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

  const addSolution = async (problemId: string, params: Omit<CreateBlogParams, 'blogType'>) => {
    try {
      const response = await createSolution(problemId, params)
      if (response.code === 200) {
        ElMessage.success('题解发布成功')
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to create solution:', error)
      return false
    }
  }

  const fetchSolutions = async (problemId: string, params: SolutionQueryParams) => {
    solutionsLoading.value = true
    try {
      const response = await querySolutions(problemId, params)
      if (response.code === 200 && response.data) {
        solutions.value = response.data.list
        solutionsTotal.value = response.data.total
      }
    } catch (error) {
      console.error('Failed to fetch solutions:', error)
    } finally {
      solutionsLoading.value = false
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

  // Actions - 点赞（Like，新增）
  const toggleLike = async (blogId: string, isLiked: boolean) => {
    try {
      const response = isLiked ? await unlikeBlog(blogId) : await likeBlog(blogId)
      if (response.code === 200) {
        ElMessage.success(isLiked ? '已取消点赞' : '点赞成功')
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

  // Actions - 收藏（Star，保留）
  const toggleStar = async (blogId: string) => {
    try {
      const response = isStarred.value
        ? await unstarBlog(blogId)
        : await starBlog(blogId)
      if (response.code === 200) {
        isStarred.value = !isStarred.value
        ElMessage.success(isStarred.value ? '收藏成功' : '已取消收藏')
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to toggle star:', error)
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

  // Actions - 评论
  const fetchComments = async (blogId: string, params: CommentQueryParams) => {
    commentsLoading.value = true
    try {
      const response = await queryBlogComments(blogId, params)
      if (response.code === 200 && response.data) {
        comments.value = response.data.list
        commentsTotal.value = response.data.total
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    } finally {
      commentsLoading.value = false
    }
  }

  const addComment = async (blogId: string, params: CreateCommentParams) => {
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

  const removeComment = async (commentId: string) => {
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

  // Actions - 用户博客
  const fetchUserBlogInfo = async (userId: string) => {
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

  const fetchUserBlogs = async (userId: string, params: UserBlogQueryParams) => {
    loading.value = true
    try {
      const response = await queryUserBlogs(userId, params)
      if (response.code === 200 && response.data) {
        userBlogs.value = response.data.list
        userBlogsTotal.value = response.data.total
      }
    } catch (error) {
      console.error('Failed to fetch user blogs:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchUserStarredBlogs = async (userId: string, params: UserStarQueryParams) => {
    loading.value = true
    try {
      const response = await queryUserStarredBlogs(userId, params)
      if (response.code === 200 && response.data) {
        userStarredBlogs.value = response.data.list
        userStarredTotal.value = response.data.total
      }
    } catch (error) {
      console.error('Failed to fetch user starred blogs:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchUserLikedBlogs = async (userId: string, params: UserLikeQueryParams) => {
    loading.value = true
    try {
      const response = await queryUserLikedBlogs(userId, params)
      if (response.code === 200 && response.data) {
        userLikedBlogs.value = response.data.list
        userLikedTotal.value = response.data.total
      }
    } catch (error) {
      console.error('Failed to fetch user liked blogs:', error)
    } finally {
      loading.value = false
    }
  }

  // 清空
  const clearCurrentBlog = () => {
    currentBlog.value = null
  }

  const clearComments = () => {
    comments.value = []
    commentsTotal.value = 0
  }

  const clearUserBlogLists = () => {
    userBlogs.value = []
    userBlogsTotal.value = 0
    userStarredBlogs.value = []
    userStarredTotal.value = 0
    userLikedBlogs.value = []
    userLikedTotal.value = 0
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
    isStarred,
    comments,
    commentsTotal,
    commentsLoading,
    userBlogInfo,
    userBlogs,
    userBlogsTotal,
    userStarredBlogs,
    userStarredTotal,
    userLikedBlogs,
    userLikedTotal,

    // Actions
    fetchBlogs,
    fetchBlogDetail,
    addBlog,
    addSolution,
    fetchSolutions,
    removeBlog,
    toggleLike,
    toggleStar,
    fetchTags,
    addImage,
    removeImage,
    fetchComments,
    addComment,
    removeComment,
    fetchUserBlogInfo,
    fetchUserBlogs,
    fetchUserStarredBlogs,
    fetchUserLikedBlogs,
    clearCurrentBlog,
    clearComments,
    clearUserBlogLists
  }
})
