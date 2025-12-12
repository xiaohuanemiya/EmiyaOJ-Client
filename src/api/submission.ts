import request from '@/utils/request'
import type { PageDTO, PageVO, SubmitCodeDTO, SubmissionVO } from '@/types/api'

export const submissionAPI = {
  /** 提交代码 */
  submit(data: SubmitCodeDTO) {
    return request<number>({
      url: '/submission/submit',
      method: 'POST',
      data
    })
  },
  
  /** 分页查询提交记录 */
  getPage(params: PageDTO & {
    problemId?: number
    userId?: number
  }) {
    return request<PageVO<SubmissionVO>>({
      url: '/submission/page',
      method: 'GET',
      params
    })
  },
  
  /** 获取提交详情 */
  getDetail(id: number) {
    return request<SubmissionVO>({
      url: `/submission/${id}`,
      method: 'GET'
    })
  }
}
