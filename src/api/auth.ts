import { request } from './request'
import type { AxiosRequestConfig } from 'axios'

type AuthRequestConfig = AxiosRequestConfig & {
  _skipAuthRedirect?: boolean
}

const AUTH_BASE = '/api/auth'

function postAuthApi<TResponse = unknown, TPayload = unknown>(
  path: string,
  payload?: TPayload,
  config?: AuthRequestConfig
) {
  return request<TResponse>({
    url: `${AUTH_BASE}${path}`,
    method: 'post',
    ...(payload === undefined ? {} : { data: payload }),
    ...config
  })
}

export interface LoginResponse {
  token: string
}

/** 与后端 send-code scene 枚举一致 */
export type SendCodeScene =
  | 'LOGIN'
  | 'REGISTER'
  | 'RESET_PASSWORD'
  | 'ACCOUNT_CANCEL'
  | 'BIND_EMAIL'
  | 'UNBIND_EMAIL'
  | 'BIND_PHONE'
  | 'UNBIND_PHONE'

export type SendCodeRequest = {
  account: string
  scene: SendCodeScene
}

export function sendCodeApi(account: string, scene: SendCodeScene) {
  const payload: SendCodeRequest = { account, scene }
  return postAuthApi('/send-code', payload)
}

export type LoginByPasswordRequest = {
  account: string
  password: string
}

export function loginByPasswordApi(account: string, password: string) {
  const payload: LoginByPasswordRequest = { account, password }
  return postAuthApi<LoginResponse>('/login/password', payload)
}

export type LoginByCodeRequest = {
  account: string
  code: string
}

export function loginByCodeApi(account: string, code: string) {
  const payload: LoginByCodeRequest = { account, code }
  return postAuthApi<LoginResponse>('/login/code', payload)
}

export type RegisterByCodeRequest = {
  account: string
  code: string
  password: string
  username: string
}

export function registerByCodeApi(account: string, code: string, password: string, username: string) {
  const payload: RegisterByCodeRequest = { account, code, password, username }
  return postAuthApi('/register/code', payload)
}

export type RegisterByUsernameRequest = {
  username: string
  password: string
}

export function registerByUsernameApi(username: string, password: string) {
  const payload: RegisterByUsernameRequest = { username, password }
  return postAuthApi<unknown>('/register/username', payload)
}

export type ResetPasswordRequest = {
  account: string
  code: string
  newPassword: string
}

export function resetPasswordApi(account: string, code: string, newPassword: string) {
  const payload: ResetPasswordRequest = { account, code, newPassword }
  return postAuthApi<unknown>('/reset-password', payload)
}

export function logoutApi() {
  return postAuthApi('/logout')
}
