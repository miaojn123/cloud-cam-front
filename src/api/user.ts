import { request } from './request'

export interface CurrentUser {
  uuid: string
  userName: string
  nickName: string
  email: string | null
  phone: string | null
  sex: number
  avatar: string
  // 中文注释：个人资料扩展字段（允许为空字符串）
  organization?: string | null
  industry?: string | null
  role: number
  status: number
  lastLoginAt: string | null
  lastLoginIp: string | null
  createdAt: string
}

export interface CurrentUserResponse {
  user: CurrentUser
}

export type UploadAvatarResponse = {
  avatar: string
}

export function getCurrentUserApi() {
  return request<CurrentUserResponse>({
    url: '/api/user/current',
    method: 'post'
  })
}

export function uploadCurrentUserAvatarApi(file: File) {
  const form = new FormData()
  // 中文注释：后端约定字段名为 file（multipart/form-data）
  form.append('file', file)
  return request<UploadAvatarResponse>({
    url: '/api/user/current/avatar',
    method: 'post',
    data: form
  })
}

export type UpdateOrganizationRequest = {
  organization: string
}

export function updateCurrentUserOrganizationApi(organization: string) {
  const payload: UpdateOrganizationRequest = { organization }
  return request<unknown>({
    url: '/api/user/current/organization',
    method: 'post',
    data: payload
  })
}

export type UpdateIndustryRequest = {
  industry: string
}

export function updateCurrentUserIndustryApi(industry: string) {
  const payload: UpdateIndustryRequest = { industry }
  return request<unknown>({
    url: '/api/user/current/industry',
    method: 'post',
    data: payload
  })
}
