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
  UserBlogQueryParams
} from '@/types/blog'

/**
 * 查询所有博客
 */
export const getAllBlogs = (): Promise<ApiResponse<Blog[]>> => {
  return request({
    url: '/client/blog',
    method: 'GET'
  })
}

/**
 * 发布博客
 */
export const createBlog = (data: CreateBlogParams): Promise<ApiResponse<null>> => {
  return request({
    url: '/client/blog',
    method: 'POST',
    data
  })
}

/**
 * 分页条件查询博客
 */
export const queryBlogs = (
  data: BlogQueryParams
): Promise<ApiResponse<PageResult<Blog>>> => {
  return request({
    url: '/client/blog/query',
    method: 'POST',
    data
  })
}

/**
 * 获取指定博客
 */
export const getBlogDetail = (bid: string | number): Promise<ApiResponse<Blog>> => {
  return request({
    url: `/client/blog/${bid}`,
    method: 'GET'
  })
}

/**
 * 删除博客
 */
export const deleteBlog = (bid: string | number): Promise<ApiResponse<null>> => {
  return request({
    url: `/client/blog/${bid}`,
    method: 'DELETE'
  })
}

/**
 * 修改博客
 */
export const updateBlog = (
  bid: string | number,
  data: UpdateBlogParams
): Promise<ApiResponse<null>> => {
  return request({
    url: `/client/blog/${bid}`,
    method: 'PUT',
    data
  })
}

/**
 * 分页查询博客评论
 */
export const queryBlogComments = (
  bid: string | number,
  data: CommentQueryParams
): Promise<ApiResponse<PageResult<Comment>>> => {
  return request({
    url: `/client/blog/${bid}/comments/query`,
    method: 'POST',
    data
  })
}

/**
 * 发表评论
 */
export const createComment = (
  bid: string | number,
  data: CreateCommentParams
): Promise<ApiResponse<null>> => {
  return request({
    url: `/client/blog/${bid}/comments`,
    method: 'POST',
    data
  })
}

/**
 * 收藏博客
 */
export const starBlog = (bid: string | number): Promise<ApiResponse<null>> => {
  return request({
    url: `/client/blog/${bid}/star`,
    method: 'POST'
  })
}

/**
 * 取消收藏博客
 */
export const unstarBlog = (bid: string | number): Promise<ApiResponse<null>> => {
  return request({
    url: `/client/blog/${bid}/star`,
    method: 'DELETE'
  })
}

/**
 * 查询博客模块用户信息
 */
export const getUserBlogInfo = (uid: string | number): Promise<ApiResponse<UserBlogInfo>> => {
  return request({
    url: `/client/blog/user/${uid}`,
    method: 'GET'
  })
}

/**
 * 分页查询用户发表的博客
 */
export const queryUserBlogs = (
  uid: string | number,
  data: UserBlogQueryParams
): Promise<ApiResponse<PageResult<Blog>>> => {
  return request({
    url: `/client/blog/user/${uid}/blogs/query`,
    method: 'POST',
    data
  })
}

/**
 * 分页查询用户收藏的博客
 */
export const queryUserStarredBlogs = (
  uid: string | number,
  data: UserBlogQueryParams
): Promise<ApiResponse<PageResult<Blog>>> => {
  return request({
    url: `/client/blog/user/${uid}/stars/query`,
    method: 'POST',
    data
  })
}

/**
 * 查询所有标签
 */
export const getAllTags = (): Promise<ApiResponse<BlogTag[]>> => {
  return request({
    url: '/client/blog/tags',
    method: 'GET'
  })
}

/**
 * 条件查询评论
 */
export const searchComments = (
  data: CommentSearchParams
): Promise<ApiResponse<Comment[]>> => {
  return request({
    url: '/client/blog/comments/query',
    method: 'POST',
    data
  })
}

/**
 * 获取指定评论
 */
export const getCommentDetail = (cid: string | number): Promise<ApiResponse<Comment>> => {
  return request({
    url: `/client/blog/comments/${cid}`,
    method: 'GET'
  })
}

/**
 * 删除评论
 */
export const deleteComment = (cid: string | number): Promise<ApiResponse<null>> => {
  return request({
    url: `/client/blog/comments/${cid}`,
    method: 'DELETE'
  })
}
