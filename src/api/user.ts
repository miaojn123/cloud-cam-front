import http, { type AjaxResult } from '@/utils/http'
import type { AxiosRequestConfig } from 'axios'
import type { CurrentUser } from '@/types/user'

type UserRequestConfig = AxiosRequestConfig & {
  _skipAuthRedirect?: boolean
}

const USER_CURRENT_BASE = '/api/user/current'

/** 统一发送当前用户模块 POST 请求。 */
function postUserApi<TResponse = unknown, TPayload = unknown>(
  path: string,
  payload?: TPayload,
  config?: UserRequestConfig
) {
  return http({
    url: `${USER_CURRENT_BASE}${path}`,
    method: 'post',
    ...(payload === undefined ? {} : { data: payload }),
    ...config
  }) as Promise<AjaxResult<TResponse>>
}

export type { CurrentUser }

export interface CurrentUserResponse {
  user: CurrentUser
}

export type UploadAvatarResponse = {
  avatar: string
}

export type UploadCurrentUserAvatarRequest = {
  file: File
}

/** 获取当前登录用户信息。 */
export function getCurrentUserApi(config?: UserRequestConfig) {
  return postUserApi<CurrentUserResponse>('', undefined, config)
}

/** 上传当前用户头像。 */
export function uploadCurrentUserAvatarApi(request: UploadCurrentUserAvatarRequest) {
  const form = new FormData()
  // 后端约定字段名为 file（multipart/form-data）
  form.append('file', request.file)
  return postUserApi<UploadAvatarResponse, FormData>('/avatar', form)
}

export type UpdateOrganizationRequest = {
  organization: string
}

/** 更新当前用户所属组织。 */
export function updateCurrentUserOrganizationApi(request: UpdateOrganizationRequest) {
  return postUserApi('/organization', request)
}

export type UpdateIndustryRequest = {
  industry: string
}

/** 更新当前用户行业。 */
export function updateCurrentUserIndustryApi(request: UpdateIndustryRequest) {
  return postUserApi('/industry', request)
}

export type UpdateNickNameRequest = {
  nickName: string
}

/** 更新当前用户昵称。 */
export function updateCurrentUserNickNameApi(request: UpdateNickNameRequest) {
  return postUserApi('/nickname', request)
}

export type UpdateUserNameRequest = {
  username: string
}

/** 更新当前用户名。 */
export function updateCurrentUserUserNameApi(request: UpdateUserNameRequest) {
  return postUserApi('/username', request)
}

export type BindCurrentUserEmailRequest = {
  email: string
  code: string
}

/** 绑定当前用户邮箱。 */
export function bindCurrentUserEmailApi(request: BindCurrentUserEmailRequest) {
  return postUserApi('/email/bind', request)
}

export type UnbindCurrentUserEmailRequest = {
  code: string
}

/** 解绑当前用户邮箱。 */
export function unbindCurrentUserEmailApi(request: UnbindCurrentUserEmailRequest) {
  return postUserApi('/email/unbind', request)
}

export type BindCurrentUserPhoneRequest = {
  phone: string
  code: string
}

/** 绑定当前用户手机号。 */
export function bindCurrentUserPhoneApi(request: BindCurrentUserPhoneRequest) {
  return postUserApi('/phone/bind', request)
}

export type UnbindCurrentUserPhoneRequest = {
  code: string
}

/** 解绑当前用户手机号。 */
export function unbindCurrentUserPhoneApi(request: UnbindCurrentUserPhoneRequest) {
  return postUserApi('/phone/unbind', request)
}

export type UpdateCurrentUserPasswordRequest = {
  oldPassword: string
  newPassword: string
}

/** 已登录：凭原密码修改登录密码 */
export function updateCurrentUserPasswordApi(request: UpdateCurrentUserPasswordRequest) {
  return postUserApi('/password', request)
}

export type DeleteCurrentAccountByPasswordRequest = {
  password: string
}

/** 通过密码注销当前账号。 */
export function deleteCurrentAccountByPasswordApi(request: DeleteCurrentAccountByPasswordRequest) {
  return postUserApi('/delete/password', request)
}

export type DeleteCurrentAccountByCodeRequest = {
  account: string
  code: string
}

/** 通过验证码注销当前账号。 */
export function deleteCurrentAccountByCodeApi(request: DeleteCurrentAccountByCodeRequest) {
  return postUserApi('/delete/code', request)
}
