/**
 * 博客评论 API 服务
 */

import { httpClient } from './http';
import type {
  ApiResponse,
  PageData,
  BlogComment,
  CreateCommentRequest,
  CommentPageQuery,
  LikeResponse,
} from '../types/blog';

/**
 * 评论 API 基础路径
 */
const COMMENT_BASE_PATH = '/client/blog/comment';

/**
 * 评论 API 服务类
 */
export class CommentApi {
  /**
   * 分页查询博客评论
   * @param query 查询参数
   * @returns 分页评论列表
   */
  static async page(query: CommentPageQuery): Promise<ApiResponse<PageData<BlogComment>>> {
    return httpClient.get<PageData<BlogComment>>(`${COMMENT_BASE_PATH}/page`, query);
  }

  /**
   * 获取评论详情
   * @param id 评论ID
   * @returns 评论详细信息
   */
  static async getById(id: number): Promise<ApiResponse<BlogComment>> {
    return httpClient.get<BlogComment>(`${COMMENT_BASE_PATH}/${id}`);
  }

  /**
   * 创建评论
   * @param data 评论数据
   * @returns 新创建的评论ID
   */
  static async create(data: CreateCommentRequest): Promise<ApiResponse<number>> {
    return httpClient.post<number>(`${COMMENT_BASE_PATH}/create`, data);
  }

  /**
   * 删除评论
   * @param id 评论ID
   * @returns 删除结果
   */
  static async delete(id: number): Promise<ApiResponse<boolean>> {
    return httpClient.delete<boolean>(`${COMMENT_BASE_PATH}/${id}`);
  }

  /**
   * 点赞/取消点赞评论
   * @param id 评论ID
   * @returns 点赞状态和点赞数
   */
  static async like(id: number): Promise<ApiResponse<LikeResponse>> {
    return httpClient.post<LikeResponse>(`${COMMENT_BASE_PATH}/${id}/like`);
  }
}

/**
 * 导出评论 API 方法
 */
export const commentApi = {
  page: CommentApi.page.bind(CommentApi),
  getById: CommentApi.getById.bind(CommentApi),
  create: CommentApi.create.bind(CommentApi),
  delete: CommentApi.delete.bind(CommentApi),
  like: CommentApi.like.bind(CommentApi),
};

export default commentApi;
