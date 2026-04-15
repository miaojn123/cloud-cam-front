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
  return postAuthApi('/send-code', { account, scene })
}

export type LoginByPasswordRequest = {
  account: string
  password: string
}

export function loginByPasswordApi(account: string, password: string) {
  return postAuthApi<LoginResponse>('/login/password', { account, password })
}

export type LoginByCodeRequest = {
  account: string
  code: string
}

export function loginByCodeApi(account: string, code: string) {
  return postAuthApi<LoginResponse>('/login/code', { account, code })
}

export type RegisterByCodeRequest = {
  account: string
  code: string
  password: string
  username: string
}

export function registerByCodeApi(account: string, code: string, password: string, username: string) {
  return postAuthApi('/register/code', { account, code, password, username })
}

export type RegisterByUsernameRequest = {
  username: string
  password: string
}

export function registerByUsernameApi(username: string, password: string) {
  return postAuthApi<unknown>('/register/username', { username, password })
}

export type ResetPasswordRequest = {
  account: string
  code: string
  newPassword: string
}

export function resetPasswordApi(account: string, code: string, newPassword: string) {
  return postAuthApi<unknown>('/reset-password', { account, code, newPassword })
}

export function logoutApi() {
  return postAuthApi('/logout')
}
