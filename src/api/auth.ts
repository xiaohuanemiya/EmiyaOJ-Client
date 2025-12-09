import request from '@/utils/request'
import type { ResponseResult, UserLoginDTO, UserLoginVO } from '@/types/api'

export const authAPI = {
  /** 用户登录 */
  async login(data: UserLoginDTO) {
    const response = await request<ResponseResult<UserLoginVO>>({
      url: '/auth/login',
      method: 'POST',
      data
    })
    return response.data
  },

  /** 用户登出 */
  async logout() {
    const response = await request<ResponseResult<null>>({
      url: '/auth/logout',
      method: 'POST'
    })
    return response.data
  }
}
