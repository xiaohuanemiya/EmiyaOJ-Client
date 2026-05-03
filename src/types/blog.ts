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
