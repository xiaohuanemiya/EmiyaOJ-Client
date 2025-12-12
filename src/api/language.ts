import request from '@/utils/request'
import type { Language } from '@/types/api'

export const languageAPI = {
  /** 获取所有可用语言 */
  getList() {
    return request<Language[]>({
      url: '/language/list',
      method: 'GET'
    })
  },
  
  /** 获取语言详情 */
  getDetail(id: number) {
    return request<Language>({
      url: `/language/${id}`,
      method: 'GET'
    })
  }
}
