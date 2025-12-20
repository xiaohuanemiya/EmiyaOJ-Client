/**
 * 博客系统 API 入口文件
 * 统一导出所有博客相关的 API 服务
 */

import { blogApi } from './blog';
import { commentApi } from './comment';
import { tagApi } from './tag';

export { blogApi, BlogApi } from './blog';
export { commentApi, CommentApi } from './comment';
export { tagApi, TagApi } from './tag';
export { httpClient, default as HttpClient } from './http';

/**
 * 博客系统 API 命名空间
 */
export const BlogSystem = {
  blog: blogApi,
  comment: commentApi,
  tag: tagApi,
};

export default BlogSystem;
