// api/language.ts - 语言相关接口
import request from '@/utils/request'
import type { ResponseResult, Language } from '@/types/api'

export const languageAPI = {
  /** 获取所有可用语言 */
  getList() {
    return request<ResponseResult<Language[]>>({
      url: '/client/language/list',
      method: 'GET'
    })
  },
  
  /** 获取语言详情 */
  getDetail(id: number) {
    return request<ResponseResult<Language>>({
      url: `/client/language/${id}`,
      method: 'GET'
    })
  }
}
