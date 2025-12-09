import request from '@/utils/request'
import type { ResponseResult, PageDTO, PageVO, SubmitCodeDTO, SubmissionVO } from '@/types/api'

export const submissionAPI = {
  /** 提交代码 */
  async submit(data: SubmitCodeDTO) {
    const response = await request<ResponseResult<number>>({
      url: '/client/submission/client/submit',
      method: 'POST',
      data
    })
    return response.data
  },

  /** 分页查询提交记录 */
  async getPage(
    params: PageDTO & {
      problemId?: number
      userId?: number
    }
  ) {
    const response = await request<ResponseResult<PageVO<SubmissionVO>>>({
      url: '/client/submission/page',
      method: 'GET',
      params
    })
    return response.data
  },

  /** 获取提交详情 */
  async getDetail(id: number) {
    const response = await request<ResponseResult<SubmissionVO>>({
      url: `/client/submission/${id}`,
      method: 'GET'
    })
    return response.data
  }
}
