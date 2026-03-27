import { request } from './request'

export interface CurrentUser {
  uuid: string
  userName: string
  nickName: string
  email: string | null
  phone: string | null
  sex: number
  avatar: string
  role: number
  status: number
  lastLoginAt: string | null
  lastLoginIp: string | null
  createdAt: string
}

export interface CurrentUserResponse {
  user: CurrentUser
}

export function getCurrentUserApi() {
  return request<CurrentUserResponse>({
    url: '/api/user/current',
    method: 'post'
  })
}
