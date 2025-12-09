import request from '@/utils/request'
import type { ResponseResult, Language } from '@/types/api'

export const languageAPI = {
  /** 获取所有可用语言 */
  async getList() {
    const response = await request<ResponseResult<Language[]>>({
      url: '/client/language/list',
      method: 'GET'
    })
    return response.data
  },

  /** 获取语言详情 */
  async getDetail(id: number) {
    const response = await request<ResponseResult<Language>>({
      url: `/client/language/${id}`,
      method: 'GET'
    })
    return response.data
  }
}
