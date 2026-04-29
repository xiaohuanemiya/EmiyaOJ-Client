// src/api/blog.ts
import request from './request'
import type { ApiResponse, PageResult } from '@/types/api'
import type {
  Blog,
  BlogTag,
  Comment,
  UserBlogInfo,
  CreateBlogParams,
  UpdateBlogParams,
  BlogQueryParams,
  CommentQueryParams,
  CommentSearchParams,
  CreateCommentParams,
  UserBlogQueryParams,
  UserStarQueryParams
} from '@/types/blog'

/**
 * 查询所有博客
 * GET /blog
 */
export const getAllBlogs = (): Promise<ApiResponse<Blog[]>> => {
  return request({
    url: '/blog',
    method: 'GET'
  })
}

/**
 * 发布博客
 * POST /blog
 */
export const createBlog = (data: CreateBlogParams): Promise<ApiResponse<string>> => {
  return request({
    url: '/blog',
    method: 'POST',
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
 * 获取指定博客信息
 * GET /blog/{bid}
 */
export const getBlogDetail = (bid: string): Promise<ApiResponse<Blog>> => {
  return request({
    url: `/blog/${bid}`,
    method: 'GET'
  })
}

/**
 * 删除博客
 * DELETE /blog/{bid}
 */
export const deleteBlog = (bid: string): Promise<ApiResponse<string>> => {
  return request({
    url: `/blog/${bid}`,
    method: 'DELETE'
  })
}

/**
 * 修改博客
 * PUT /blog/{bid}
 */
export const updateBlog = (
  bid: string,
  data: UpdateBlogParams
): Promise<ApiResponse<string>> => {
  return request({
    url: `/blog/${bid}`,
    method: 'PUT',
    data
  })
}

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
): Promise<ApiResponse<string>> => {
  return request({
    url: `/blog/${bid}/comments`,
    method: 'POST',
    data
  })
}

/**
 * 收藏博客
 * POST /blog/{bid}/star
 */
export const starBlog = (bid: string): Promise<ApiResponse<string>> => {
  return request({
    url: `/blog/${bid}/star`,
    method: 'POST'
  })
}

/**
 * 取消收藏博客
 * DELETE /blog/{bid}/star
 */
export const unstarBlog = (bid: string): Promise<ApiResponse<string>> => {
  return request({
    url: `/blog/${bid}/star`,
    method: 'DELETE'
  })
}

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

/**
 * 条件查询评论
 * POST /blog/comments/query
 */
export const searchComments = (
  data: CommentSearchParams
): Promise<ApiResponse<Comment[]>> => {
  return request({
    url: '/blog/comments/query',
    method: 'POST',
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
export const deleteComment = (cid: string): Promise<ApiResponse<string>> => {
  return request({
    url: `/blog/comments/${cid}`,
    method: 'DELETE'
  })
}
