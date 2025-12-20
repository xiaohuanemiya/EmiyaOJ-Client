/**
 * 博客文章 API 服务
 */

import { httpClient } from './http';
import type {
  ApiResponse,
  PageData,
  BlogPost,
  BlogDetail,
  CreateBlogRequest,
  UpdateBlogRequest,
  BlogPageQuery,
  LikeResponse,
} from '../types/blog';

/**
 * 博客 API 基础路径
 */
const BLOG_BASE_PATH = '/client/blog';

/**
 * 博客 API 服务类
 */
export class BlogApi {
  /**
   * 分页查询博客文章
   * @param query 查询参数
   * @returns 分页博客列表
   */
  static async page(query: BlogPageQuery): Promise<ApiResponse<PageData<BlogPost>>> {
    return httpClient.get<PageData<BlogPost>>(`${BLOG_BASE_PATH}/page`, query);
  }

  /**
   * 获取博客详情
   * @param id 博客ID
   * @returns 博客详细信息
   */
  static async getById(id: number): Promise<ApiResponse<BlogDetail>> {
    return httpClient.get<BlogDetail>(`${BLOG_BASE_PATH}/${id}`);
  }

  /**
   * 创建博客文章
   * @param data 博客数据
   * @returns 新创建的博客ID
   */
  static async create(data: CreateBlogRequest): Promise<ApiResponse<number>> {
    return httpClient.post<number>(`${BLOG_BASE_PATH}/create`, data);
  }

  /**
   * 更新博客文章
   * @param data 更新数据
   * @returns 更新结果
   */
  static async update(data: UpdateBlogRequest): Promise<ApiResponse<boolean>> {
    return httpClient.put<boolean>(`${BLOG_BASE_PATH}/update`, data);
  }

  /**
   * 删除博客文章
   * @param id 博客ID
   * @returns 删除结果
   */
  static async delete(id: number): Promise<ApiResponse<boolean>> {
    return httpClient.delete<boolean>(`${BLOG_BASE_PATH}/${id}`);
  }

  /**
   * 点赞/取消点赞博客
   * @param id 博客ID
   * @returns 点赞状态和点赞数
   */
  static async like(id: number): Promise<ApiResponse<LikeResponse>> {
    return httpClient.post<LikeResponse>(`${BLOG_BASE_PATH}/${id}/like`);
  }
}

/**
 * 导出博客 API 方法
 */
export const blogApi = {
  page: BlogApi.page.bind(BlogApi),
  getById: BlogApi.getById.bind(BlogApi),
  create: BlogApi.create.bind(BlogApi),
  update: BlogApi.update.bind(BlogApi),
  delete: BlogApi.delete.bind(BlogApi),
  like: BlogApi.like.bind(BlogApi),
};

export default blogApi;
