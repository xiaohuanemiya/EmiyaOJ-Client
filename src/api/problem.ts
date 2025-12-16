import request from '@/utils/request'
import type { PageDTO, PageVO, ProblemVO } from '@/types/api'

export const problemAPI = {
  /** 分页查询题目列表 */
  getPage(params: PageDTO & {
    difficulty?: number
    status?: number
    keyword?: string
  }) {
    return request<PageVO<ProblemVO>>({
      url: '/client/problem/page',
      method: 'GET',
      params
    })
  },
  
  /** 获取题目详情 */
  getDetail(id: number) {
    return request<ProblemVO>({
      url: `/client/problem/${id}`,
      method: 'GET'
    })
  }
}
