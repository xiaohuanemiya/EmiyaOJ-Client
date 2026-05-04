// src/api/blog.ts
import request from './request'
import { useAuthStore } from '@/stores/auth'
import type { ApiResponse, PageResult } from '@/types/api'
import type {
  Blog,
  BlogTag,
  BlogPicture,
  CreateBlogParams,
  BlogQueryParams,
  SolutionQueryParams,
  Comment,
  UserBlogInfo,
  CommentQueryParams,
  CommentSearchParams,
  CreateCommentParams,
  UserBlogQueryParams,
  UserStarQueryParams
} from '@/types/blog'

/** 获取当前用户 ID，用于 X-User-Id 请求头 */
const getUserIdHeader = () => {
  const authStore = useAuthStore()
  const userId = authStore.user?.id
  return userId ? { 'X-User-Id': userId } : {}
}

/**
 * 发布博客
 * POST /blog
 */
export const createBlog = (data: CreateBlogParams): Promise<ApiResponse<null>> => {
  return request({
    url: '/blog',
    method: 'POST',
    headers: getUserIdHeader(),
    data
  })
}

/**
 * 发布/更新题解
 * POST /blog/problems/{problemId}/solutions
 */
export const createSolution = (
  problemId: string,
  data: Omit<CreateBlogParams, 'blogType'>
): Promise<ApiResponse<null>> => {
  return request({
    url: `/blog/problems/${problemId}/solutions`,
    method: 'POST',
    headers: getUserIdHeader(),
    data
  })
}

/**
 * 分页条件查询博客
 * POST /blog/query
 */
export const queryBlogs = (
  data: BlogQueryParams
): Promise<ApiResponse<PageResult<Blog>>> => {
  return request({
    url: '/blog/query',
    method: 'POST',
    data
  })
}

/**
 * 分页查询题解列表
 * POST /blog/problems/{problemId}/solutions/query
 */
export const querySolutions = (
  problemId: string,
  data: SolutionQueryParams
): Promise<ApiResponse<PageResult<Blog>>> => {
  return request({
    url: `/blog/problems/${problemId}/solutions/query`,
    method: 'POST',
    data
  })
}

/**
 * 获取博客详情
 * GET /blog/{bid}
 */
export const getBlogDetail = (bid: string): Promise<ApiResponse<Blog>> => {
  return request({
    url: `/blog/${bid}`,
    method: 'GET',
    headers: getUserIdHeader()
  })
}

/**
 * 删除博客
 * DELETE /blog/{bid}
 */
export const deleteBlog = (bid: string): Promise<ApiResponse<null>> => {
  return request({
    url: `/blog/${bid}`,
    method: 'DELETE',
    headers: getUserIdHeader()
  })
}

/**
 * 点赞博客
 * POST /blog/{bid}/like
 */
export const likeBlog = (bid: string): Promise<ApiResponse<null>> => {
  return request({
    url: `/blog/${bid}/like`,
    method: 'POST',
    headers: getUserIdHeader()
  })
}

/**
 * 取消点赞博客
 * DELETE /blog/{bid}/like
 */
export const unlikeBlog = (bid: string): Promise<ApiResponse<null>> => {
  return request({
    url: `/blog/${bid}/like`,
    method: 'DELETE',
    headers: getUserIdHeader()
  })
}

/**
 * 上传图片
 * POST /blog/images (multipart/form-data)
 */
export const uploadImage = (file: File): Promise<ApiResponse<BlogPicture>> => {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/blog/images',
    method: 'POST',
    headers: {
      ...getUserIdHeader(),
      'Content-Type': 'multipart/form-data'
    },
    data: formData
  })
}

/**
 * 删除上传的图片
 * DELETE /blog/images/{id}
 */
export const deleteImage = (id: string): Promise<ApiResponse<null>> => {
  return request({
    url: `/blog/images/${id}`,
    method: 'DELETE',
    headers: getUserIdHeader()
  })
}

/**
 * 查询所有标签
 * GET /blog/tags
 */
export const getAllTags = (): Promise<ApiResponse<BlogTag[]>> => {
  return request({
    url: '/blog/tags',
    method: 'GET'
  })
}

// ==================== 收藏（Star） ====================

/**
 * 收藏博客
 * POST /blog/{bid}/star
 */
export const starBlog = (bid: string): Promise<ApiResponse<null>> => {
  return request({
    url: `/blog/${bid}/star`,
    method: 'POST',
    headers: getUserIdHeader()
  })
}

/**
 * 取消收藏博客
 * DELETE /blog/{bid}/star
 */
export const unstarBlog = (bid: string): Promise<ApiResponse<null>> => {
  return request({
    url: `/blog/${bid}/star`,
    method: 'DELETE',
    headers: getUserIdHeader()
  })
}

// ==================== 评论（Comment） ====================

/**
 * 分页查询博客评论
 * POST /blog/{bid}/comments/query
 */
export const queryBlogComments = (
  bid: string,
  data: CommentQueryParams
): Promise<ApiResponse<PageResult<Comment>>> => {
  return request({
    url: `/blog/${bid}/comments/query`,
    method: 'POST',
    data
  })
}

/**
 * 发表评论
 * POST /blog/{bid}/comments
 */
export const createComment = (
  bid: string,
  data: CreateCommentParams
): Promise<ApiResponse<null>> => {
  return request({
    url: `/blog/${bid}/comments`,
    method: 'POST',
    headers: getUserIdHeader(),
    data
  })
}

/**
 * 获取指定评论
 * GET /blog/comments/{cid}
 */
export const getCommentDetail = (cid: string): Promise<ApiResponse<Comment>> => {
  return request({
    url: `/blog/comments/${cid}`,
    method: 'GET'
  })
}

/**
 * 删除评论
 * DELETE /blog/comments/{cid}
 */
export const deleteComment = (cid: string): Promise<ApiResponse<null>> => {
  return request({
    url: `/blog/comments/${cid}`,
    method: 'DELETE',
    headers: getUserIdHeader()
  })
}

// ==================== 用户博客 ====================

/**
 * 查询博客模块用户信息
 * GET /blog/user/{uid}
 */
export const getUserBlogInfo = (uid: string): Promise<ApiResponse<UserBlogInfo>> => {
  return request({
    url: `/blog/user/${uid}`,
    method: 'GET'
  })
}

/**
 * 分页查询用户发表的博客
 * POST /blog/user/{uid}/blogs/query
 */
export const queryUserBlogs = (
  uid: string,
  data: UserBlogQueryParams
): Promise<ApiResponse<PageResult<Blog>>> => {
  return request({
    url: `/blog/user/${uid}/blogs/query`,
    method: 'POST',
    data
  })
}

/**
 * 分页查询用户收藏的博客
 * POST /blog/user/{uid}/stars/query
 */
export const queryUserStarredBlogs = (
  uid: string,
  data: UserStarQueryParams
): Promise<ApiResponse<PageResult<Blog>>> => {
  return request({
    url: `/blog/user/${uid}/stars/query`,
    method: 'POST',
    data
  })
}
