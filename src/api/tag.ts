/**
 * 博客标签 API 服务
 */

import { httpClient } from './http';
import type {
  ApiResponse,
  PageData,
  BlogTag,
  CreateTagRequest,
  UpdateTagRequest,
  TagPageQuery,
} from '../types/blog';

/**
 * 标签 API 基础路径
 */
const TAG_BASE_PATH = '/client/blog/tag';

/**
 * 标签 API 服务类
 */
export class TagApi {
  /**
   * 获取所有标签
   * @returns 标签列表
   */
  static async list(): Promise<ApiResponse<BlogTag[]>> {
    return httpClient.get<BlogTag[]>(`${TAG_BASE_PATH}/list`);
  }

  /**
   * 分页查询标签
   * @param query 查询参数
   * @returns 分页标签列表
   */
  static async page(query: TagPageQuery): Promise<ApiResponse<PageData<BlogTag>>> {
    return httpClient.get<PageData<BlogTag>>(`${TAG_BASE_PATH}/page`, query);
  }

  /**
   * 获取标签详情
   * @param id 标签ID
   * @returns 标签详细信息
   */
  static async getById(id: number): Promise<ApiResponse<BlogTag>> {
    return httpClient.get<BlogTag>(`${TAG_BASE_PATH}/${id}`);
  }

  /**
   * 创建标签
   * @param data 标签数据
   * @returns 新创建的标签ID
   */
  static async create(data: CreateTagRequest): Promise<ApiResponse<number>> {
    return httpClient.post<number>(`${TAG_BASE_PATH}/create`, data);
  }

  /**
   * 更新标签
   * @param data 更新数据
   * @returns 更新结果
   */
  static async update(data: UpdateTagRequest): Promise<ApiResponse<boolean>> {
    return httpClient.put<boolean>(`${TAG_BASE_PATH}/update`, data);
  }

  /**
   * 删除标签
   * @param id 标签ID
   * @returns 删除结果
   */
  static async delete(id: number): Promise<ApiResponse<boolean>> {
    return httpClient.delete<boolean>(`${TAG_BASE_PATH}/${id}`);
  }
}

/**
 * 导出标签 API 方法
 */
export const tagApi = {
  list: TagApi.list.bind(TagApi),
  page: TagApi.page.bind(TagApi),
  getById: TagApi.getById.bind(TagApi),
  create: TagApi.create.bind(TagApi),
  update: TagApi.update.bind(TagApi),
  delete: TagApi.delete.bind(TagApi),
};

export default tagApi;
