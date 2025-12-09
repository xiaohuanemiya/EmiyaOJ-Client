// api/problem.ts - 题目相关接口
import request from '@/utils/request'
import type { ResponseResult, PageVO, ProblemVO, ProblemQueryDTO } from '@/types/api'

export const problemAPI = {
  /** 分页查询题目列表 */
  getPage(params: ProblemQueryDTO) {
    return request<ResponseResult<PageVO<ProblemVO>>>({
      url: '/client/problem/page',
      method: 'GET',
      params
    })
  },
  
  /** 获取题目详情 */
  getDetail(id: number) {
    return request<ResponseResult<ProblemVO>>({
      url: `/client/problem/${id}`,
      method: 'GET'
    })
  }
}
