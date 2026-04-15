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
  return postUserApi('/organization', { organization })
}

export type UpdateIndustryRequest = {
  industry: string
}

export function updateCurrentUserIndustryApi(industry: string) {
  return postUserApi('/industry', { industry })
}

export type UpdateNickNameRequest = {
  nickName: string
}

export function updateCurrentUserNickNameApi(nickName: string) {
  return postUserApi('/nickname', { nickName })
}

export type UpdateUserNameRequest = {
  username: string
}

export function updateCurrentUserUserNameApi(username: string) {
  return postUserApi('/username', { username })
}

export type BindCurrentUserEmailRequest = {
  email: string
  code: string
}

export function bindCurrentUserEmailApi(email: string, code: string) {
  return postUserApi('/email/bind', { email, code })
}

export type UnbindCurrentUserEmailRequest = {
  code: string
}

export function unbindCurrentUserEmailApi(code: string) {
  return postUserApi('/email/unbind', { code })
}

export type BindCurrentUserPhoneRequest = {
  phone: string
  code: string
}

export function bindCurrentUserPhoneApi(phone: string, code: string) {
  return postUserApi('/phone/bind', { phone, code })
}

export type UnbindCurrentUserPhoneRequest = {
  code: string
}

export function unbindCurrentUserPhoneApi(code: string) {
  return postUserApi('/phone/unbind', { code })
}

export type UpdateCurrentUserPasswordRequest = {
  oldPassword: string
  newPassword: string
}

/** 已登录：凭原密码修改登录密码 */
export function updateCurrentUserPasswordApi(oldPassword: string, newPassword: string) {
  return postUserApi('/password', { oldPassword, newPassword })
}

export type CancelCurrentAccountByPasswordRequest = {
  password: string
}

export function cancelCurrentAccountByPasswordApi(password: string) {
  return postUserApi('/cancel/password', { password })
}

export type CancelCurrentAccountByCodeRequest = {
  account: string
  code: string
}

export function cancelCurrentAccountByCodeApi(account: string, code: string) {
  return postUserApi('/cancel/code', { account, code })
}
