// src/types/blog.ts
import type { PageQuery } from './api'

/**
 * 博客标签（博客标签 VO）
 */
export interface BlogTag {
  id: string
  name: string
  desc: string
}

/**
 * 博客信息（博客 VO）
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
 * 评论信息（博客评论 VO）
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
 * 用户博客信息（用户博客信息 VO）
 */
export interface UserBlogInfo {
  userId: string
  username: string
  nickname: string
  blogCount: number
  starCount: number
}

/**
 * 发布博客请求参数（POST /blog）
 */
export interface CreateBlogParams {
  title: string
  content: string
  tagIds: string[]
}

/**
 * 修改博客请求参数（PUT /blog/{bid}）
 */
export interface UpdateBlogParams {
  id?: string
  title: string
  content: string
}

/**
 * 博客查询参数（POST /blog/query）
 */
export interface BlogQueryParams extends PageQuery {
  title?: string
  createTime?: string
}

/**
 * 评论分页查询参数（POST /blog/{bid}/comments/query）
 */
export interface CommentQueryParams {
  pageNum?: number
  pageSize?: number
}

/**
 * 评论条件查询参数（POST /blog/comments/query）
 */
export interface CommentSearchParams {
  blogId?: string
  fromDay?: string
  toDay?: string
}

/**
 * 发表评论请求参数（POST /blog/{bid}/comments）
 */
export interface CreateCommentParams {
  content: string
}

/**
 * 用户博客查询参数（POST /blog/user/{uid}/blogs/query）
 */
export interface UserBlogQueryParams extends PageQuery {
  userId: string
}

/**
 * 用户收藏博客查询参数（POST /blog/user/{uid}/stars/query）
 */
export interface UserStarQueryParams {
  userId?: string
  pageNo: number
  pageSize: number
}
