import { request } from './request'

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

export function sendCodeApi(account: string, scene: SendCodeScene) {
  return request({
    url: '/api/auth/send-code',
    method: 'post',
    data: {
      account,
      scene
    }
  })
}

export function loginByPasswordApi(account: string, password: string) {
  return request<LoginResponse>({
    url: '/api/auth/login/password',
    method: 'post',
    data: {
      account,
      password
    }
  })
}

export function loginByCodeApi(account: string, code: string) {
  return request<LoginResponse>({
    url: '/api/auth/login/code',
    method: 'post',
    data: {
      account,
      code
    }
  })
}

export function registerByCodeApi(account: string, code: string, password: string, username: string) {
  return request({
    url: '/api/auth/register/code',
    method: 'post',
    data: {
      account,
      code,
      password,
      username
    }
  })
}

export type RegisterByUsernameRequest = {
  username: string
  password: string
}

/** POST /api/auth/register/username，与 AccountRegisterRequest 一致 */
export function registerByUsernameApi(username: string, password: string) {
  const payload: RegisterByUsernameRequest = { username, password }
  return request<unknown>({
    url: '/api/auth/register/username',
    method: 'post',
    data: payload
  })
}

/** 匿名：忘记密码后设置新密码 */
export function resetPasswordApi(account: string, code: string, newPassword: string) {
  return request<unknown>({
    url: '/api/auth/reset-password',
    method: 'post',
    data: {
      account,
      code,
      newPassword
    }
  })
}

export function logoutApi() {
  return request({
    url: '/api/auth/logout',
    method: 'post'
  })
}

