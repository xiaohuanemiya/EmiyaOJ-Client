import request from '@/utils/request'
import type { UserLoginDTO, UserLoginVO } from '@/types/api'

export const authAPI = {
  /** 用户登录 */
  login(data: UserLoginDTO) {
    return request<UserLoginVO>({
      url: '/auth/login',
      method: 'POST',
      data
    })
  },
  
  /** 用户登出 */
  logout() {
    return request<null>({
      url: '/auth/logout',
      method: 'POST'
    })
  }
}
