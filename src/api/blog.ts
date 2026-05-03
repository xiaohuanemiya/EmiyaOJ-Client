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
  SolutionQueryParams
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
