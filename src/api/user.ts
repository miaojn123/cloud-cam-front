import { request } from './request'
import type { AxiosRequestConfig } from 'axios'
import type { CurrentUser } from '@/types/user'

type UserRequestConfig = AxiosRequestConfig & {
  _skipAuthRedirect?: boolean
}

const USER_CURRENT_BASE = '/api/user/current'

function postUserApi<TResponse = unknown, TPayload = unknown>(
  path: string,
  payload?: TPayload,
  config?: UserRequestConfig
) {
  return request<TResponse>({
    url: `${USER_CURRENT_BASE}${path}`,
    method: 'post',
    ...(payload === undefined ? {} : { data: payload }),
    ...config
  })
}

export type { CurrentUser }

export interface CurrentUserResponse {
  user: CurrentUser
}

export type UploadAvatarResponse = {
  avatar: string
}

export function getCurrentUserApi(config?: UserRequestConfig) {
  return postUserApi<CurrentUserResponse>('', undefined, config)
}

export function uploadCurrentUserAvatarApi(file: File) {
  const form = new FormData()
  // 后端约定字段名为 file（multipart/form-data）
  form.append('file', file)
  return postUserApi<UploadAvatarResponse, FormData>('/avatar', form)
}

export type UpdateOrganizationRequest = {
  organization: string
}

export function updateCurrentUserOrganizationApi(organization: string) {
  const payload: UpdateOrganizationRequest = { organization }
  return postUserApi('/organization', payload)
}

export type UpdateIndustryRequest = {
  industry: string
}

export function updateCurrentUserIndustryApi(industry: string) {
  const payload: UpdateIndustryRequest = { industry }
  return postUserApi('/industry', payload)
}

export type UpdateNickNameRequest = {
  nickName: string
}

export function updateCurrentUserNickNameApi(nickName: string) {
  const payload: UpdateNickNameRequest = { nickName }
  return postUserApi('/nickname', payload)
}

export type UpdateUserNameRequest = {
  username: string
}

export function updateCurrentUserUserNameApi(username: string) {
  const payload: UpdateUserNameRequest = { username }
  return postUserApi('/username', payload)
}

export type BindCurrentUserEmailRequest = {
  email: string
  code: string
}

export function bindCurrentUserEmailApi(email: string, code: string) {
  const payload: BindCurrentUserEmailRequest = { email, code }
  return postUserApi('/email/bind', payload)
}

export type UnbindCurrentUserEmailRequest = {
  code: string
}

export function unbindCurrentUserEmailApi(code: string) {
  const payload: UnbindCurrentUserEmailRequest = { code }
  return postUserApi('/email/unbind', payload)
}

export type BindCurrentUserPhoneRequest = {
  phone: string
  code: string
}

export function bindCurrentUserPhoneApi(phone: string, code: string) {
  const payload: BindCurrentUserPhoneRequest = { phone, code }
  return postUserApi('/phone/bind', payload)
}

export type UnbindCurrentUserPhoneRequest = {
  code: string
}

export function unbindCurrentUserPhoneApi(code: string) {
  const payload: UnbindCurrentUserPhoneRequest = { code }
  return postUserApi('/phone/unbind', payload)
}

export type UpdateCurrentUserPasswordRequest = {
  oldPassword: string
  newPassword: string
}

/** 已登录：凭原密码修改登录密码 */
export function updateCurrentUserPasswordApi(oldPassword: string, newPassword: string) {
  const payload: UpdateCurrentUserPasswordRequest = { oldPassword, newPassword }
  return postUserApi('/password', payload)
}

export type CancelCurrentAccountByPasswordRequest = {
  password: string
}

export function cancelCurrentAccountByPasswordApi(password: string) {
  const payload: CancelCurrentAccountByPasswordRequest = { password }
  return postUserApi('/cancel/password', payload)
}

export type CancelCurrentAccountByCodeRequest = {
  account: string
  code: string
}

export function cancelCurrentAccountByCodeApi(account: string, code: string) {
  const payload: CancelCurrentAccountByCodeRequest = { account, code }
  return postUserApi('/cancel/code', payload)
}
