// src/types/blog.ts
import type { PageQuery } from './api'

/**
 * 博客标签 VO
 */
export interface BlogTag {
  id: string
  name: string
  desc: string
}

/**
 * 博客图片 VO
 */
export interface BlogPicture {
  id: string
  blogId: string | null
  url: string
  contentType: string
  size: number
  originalFilename: string
  createTime: string
}

/**
 * 博客 VO
 */
export interface Blog {
  id: string
  userId: string
  authorNickname?: string
  title: string
  content: string
  blogType: number        // 0=普通博客, 1=题解
  problemId: string | null
  problemTitle: string | null
  viewCount: number
  likeCount: number
  liked: boolean
  createTime: string
  updateTime: string
  tags: BlogTag[]
  pictures: BlogPicture[]
}

/**
 * 发布/保存博客请求参数 (BlogSaveDTO)
 */
export interface CreateBlogParams {
  title: string
  content: string
  blogType?: number      // 0=普通博客, 1=题解
  tagIds?: string[]
  pictureIds?: string[]
}

/**
 * 博客查询参数 (BlogQueryDTO)
 */
export interface BlogQueryParams extends PageQuery {
  title?: string
  blogType?: number       // 0=普通博客, 1=题解
  problemId?: number
  tagId?: number
  sortBy?: string         // createTime / updateTime / viewCount / likeCount
  createTime?: string
}

/**
 * 题解查询参数
 */
export interface SolutionQueryParams {
  sortBy?: string
  pageNo: number
  pageSize: number
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
  likedBlogCount?: number
}

/**
 * 评论分页查询参数（POST /blog/{bid}/comments/query）
 */
export interface CommentQueryParams {
  pageNo?: number
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
export interface UserBlogQueryParams {
  userId?: string
  pageNo: number
  pageSize: number
  auditStatus?: number
}

/**
 * 用户收藏博客查询参数（POST /blog/user/{uid}/stars/query）
 */
export interface UserStarQueryParams {
  userId?: string
  pageNo: number
  pageSize: number
}

/**
 * 用户点赞博客查询参数（POST /blog/user/{uid}/likes/query）
 */
export interface UserLikeQueryParams {
  userId?: string
  pageNo: number
  pageSize: number
}
