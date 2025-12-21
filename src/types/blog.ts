// src/types/blog.ts
import type { PageQuery } from './api'

/**
 * 博客标签
 */
export interface BlogTag {
  id: string
  name: string
  desc: string
}

/**
 * 博客信息
 */
export interface Blog {
  id: string
  userId: string
  title: string
  content: string
  createTime: string
  updateTime: string
  tags: BlogTag[]
}

/**
 * 评论信息
 */
export interface Comment {
  id: string
  userId: string
  username: string
  nickname: string
  content: string
  createTime: string
  updateTime: string
}

/**
 * 用户博客信息
 */
export interface UserBlogInfo {
  userId: string
  username: string
  nickname: string
  blogCount: number
  starCount: number
}

/**
 * 发布博客请求参数
 */
export interface CreateBlogParams {
  title: string
  content: string
  tagIds: number[]
}

/**
 * 修改博客请求参数
 */
export interface UpdateBlogParams {
  title: string
  content: string
}

/**
 * 博客查询参数
 */
export interface BlogQueryParams extends PageQuery {
  title?: string
  createTime?: string
}

/**
 * 评论查询参数
 */
export interface CommentQueryParams extends PageQuery {
  sortBy?: string
  isAsc?: boolean
}

/**
 * 评论条件查询参数
 */
export interface CommentSearchParams {
  blogId?: number
  fromDay?: string
  toDay?: string
}

/**
 * 发表评论请求参数
 */
export interface CreateCommentParams {
  content: string
}

/**
 * 用户博客查询参数
 */
export interface UserBlogQueryParams extends PageQuery {
  // userId 由路径参数提供
}
