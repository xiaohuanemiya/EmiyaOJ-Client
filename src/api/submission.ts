// api/submission.ts - 提交相关接口
import request from '@/utils/request'
import type { ResponseResult, PageVO, SubmitCodeDTO, SubmissionVO, SubmissionQueryDTO } from '@/types/api'

export const submissionAPI = {
  /** 提交代码 */
  submit(data: SubmitCodeDTO) {
    return request<ResponseResult<number>>({
      url: '/client/submission/client/submit',
      method: 'POST',
      data
    })
  },
  
  /** 分页查询提交记录 */
  getPage(params: SubmissionQueryDTO) {
    return request<ResponseResult<PageVO<SubmissionVO>>>({
      url: '/client/submission/page',
      method: 'GET',
      params
    })
  },
  
  /** 获取提交详情 */
  getDetail(id: number) {
    return request<ResponseResult<SubmissionVO>>({
      url: `/client/submission/${id}`,
      method: 'GET'
    })
  }
}
