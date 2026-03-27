import { request } from './request'

export interface LoginResponse {
  token: string
}

export function sendCodeApi(account: string, scene: string) {
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

export function logoutApi() {
  return request({
    url: '/api/auth/logout',
    method: 'post'
  })
}
