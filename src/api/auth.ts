// api/auth.ts - 认证相关接口
import request from '@/utils/request'
import type { ResponseResult, UserLoginDTO, UserLoginVO } from '@/types/api'

export const authAPI = {
  /** 用户登录 */
  login(data: UserLoginDTO) {
    return request<ResponseResult<UserLoginVO>>({
      url: '/auth/login',
      method: 'POST',
      data
    })
  },
  
  /** 用户登出 */
  logout() {
    return request<ResponseResult<null>>({
      url: '/auth/logout',
      method: 'POST'
    })
  }
}
