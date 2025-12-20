/**
 * 博客系统类型定义
 */

/**
 * 通用响应格式
 */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

/**
 * 分页数据
 */
export interface PageData<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

/**
 * 博客标签
 */
export interface BlogTag {
  id: number;
  name: string;
  description?: string;
  blogCount?: number;
  createTime?: string;
}

/**
 * 博客文章（列表）
 */
export interface BlogPost {
  id: number;
  title: string;
  summary?: string;
  userId: number;
  username: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  tags: BlogTag[];
  createTime: string;
  updateTime: string;
}

/**
 * 博客文章（详情）
 */
export interface BlogDetail extends BlogPost {
  content: string;
}

/**
 * 博客评论
 */
export interface BlogComment {
  id: number;
  blogId: number;
  userId: number;
  username: string;
  content: string;
  parentId: number;
  replyToUserId: number | null;
  replyToUsername: string | null;
  likeCount: number;
  replyCount: number;
  createTime: string;
}

/**
 * 点赞响应
 */
export interface LikeResponse {
  liked: boolean;
  likeCount: number;
}

/**
 * 创建博客请求
 */
export interface CreateBlogRequest {
  title: string;
  content: string;
  tagIds?: number[];
}

/**
 * 更新博客请求
 */
export interface UpdateBlogRequest {
  id: number;
  title?: string;
  content?: string;
  tagIds?: number[];
}

/**
 * 创建评论请求
 */
export interface CreateCommentRequest {
  blogId: number;
  content: string;
  parentId?: number;
  replyToUserId?: number | null;
}

/**
 * 创建标签请求
 */
export interface CreateTagRequest {
  name: string;
  description?: string;
}

/**
 * 更新标签请求
 */
export interface UpdateTagRequest {
  id: number;
  name?: string;
  description?: string;
}

/**
 * 分页查询博客请求参数
 */
export interface BlogPageQuery {
  current: number;
  size: number;
  keyword?: string;
  tagId?: number;
  userId?: number;
}

/**
 * 分页查询评论请求参数
 */
export interface CommentPageQuery {
  blogId: number;
  current: number;
  size: number;
  parentId?: number;
}

/**
 * 分页查询标签请求参数
 */
export interface TagPageQuery {
  current: number;
  size: number;
  keyword?: string;
}
