import request from '@/utils/request'
import type { ResponseResult, PageDTO, PageVO, ProblemVO } from '@/types/api'

export const problemAPI = {
  /** 分页查询题目列表 */
  async getPage(
    params: PageDTO & {
      difficulty?: number
      status?: number
      keyword?: string
    }
  ) {
    const response = await request<ResponseResult<PageVO<ProblemVO>>>({
      url: '/client/problem/page',
      method: 'GET',
      params
    })
    return response.data
  },

  /** 获取题目详情 */
  async getDetail(id: number) {
    const response = await request<ResponseResult<ProblemVO>>({
      url: `/client/problem/${id}`,
      method: 'GET'
    })
    return response.data
  }
}
