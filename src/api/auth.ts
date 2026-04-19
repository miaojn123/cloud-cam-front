import http, { type AjaxResult } from '@/utils/http'
import type { AxiosRequestConfig } from 'axios'

type AuthRequestConfig = AxiosRequestConfig & {
  _skipAuthRefresh?: boolean
  _skipAuthRedirect?: boolean
}

const AUTH_BASE = '/api/auth'

/** 统一发送认证模块 POST 请求。 */
function postAuthApi<TResponse = unknown, TPayload = unknown>(
  path: string,
  payload?: TPayload,
  config?: AuthRequestConfig
) {
  return http({
    url: `${AUTH_BASE}${path}`,
    method: 'post',
    ...(payload === undefined ? {} : { data: payload }),
    ...config
  }) as Promise<AjaxResult<TResponse>>
}

export interface LoginResponse {
  token: string
}

export interface RefreshResponse {
  token: string
  expireTime: number
}

/** 与后端 send-code scene 枚举一致 */
export type SendCodeScene =
  | 'LOGIN'
  | 'REGISTER'
  | 'RESET_PASSWORD'
  | 'ACCOUNT_DELETE'
  | 'BIND_EMAIL'
  | 'UNBIND_EMAIL'
  | 'BIND_PHONE'
  | 'UNBIND_PHONE'

export type SendCodeRequest = {
  account: string
  scene: SendCodeScene
}

/** 发送验证码。 */
export function sendCodeApi(request: SendCodeRequest) {
  return postAuthApi('/send-code', request)
}

export type LoginByPasswordRequest = {
  account: string
  password: string
}

/** 使用账号密码登录。 */
export function loginByPasswordApi(request: LoginByPasswordRequest) {
  return postAuthApi<LoginResponse>('/login/password', request)
}

export type LoginByCodeRequest = {
  account: string
  code: string
}

/** 使用验证码登录。 */
export function loginByCodeApi(request: LoginByCodeRequest) {
  return postAuthApi<LoginResponse>('/login/code', request)
}

export type RegisterByCodeRequest = {
  account: string
  code: string
  password: string
  username: string
}

/** 使用验证码完成注册。 */
export function registerByCodeApi(request: RegisterByCodeRequest) {
  return postAuthApi('/register/code', request)
}

export type RegisterByUsernameRequest = {
  username: string
  password: string
}

/** 使用用户名密码注册。 */
export function registerByUsernameApi(request: RegisterByUsernameRequest) {
  return postAuthApi<unknown>('/register/username', request)
}

export type ResetPasswordRequest = {
  account: string
  code: string
  newPassword: string
}

/** 使用验证码重置密码。 */
export function resetPasswordApi(request: ResetPasswordRequest) {
  return postAuthApi<unknown>('/reset-password', request)
}

/** 退出当前登录。 */
export function logoutApi() {
  return postAuthApi('/logout')
}

/** 刷新当前登录会话。 */
export function refreshApi(config?: AuthRequestConfig) {
  return postAuthApi<RefreshResponse>('/refresh', undefined, config)
}
