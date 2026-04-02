import axios from 'axios'

export interface AjaxResult<T = unknown> {
  code: number
  msg: string
  data?: T
}

const SUCCESS_CODE = 200
const UNAUTHORIZED_CODE = 401
export const TOKEN_KEY = 'auth_token'

type RetryableRequestConfig = {
  url?: string
  _retry?: boolean
  _skipAuthRefresh?: boolean
  _skipAuthRedirect?: boolean
}

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 15000
})

let refreshPromise: Promise<boolean> | null = null

function clearAuthStorage() {
  localStorage.removeItem(TOKEN_KEY)
}

function isAuthEndpoint(url?: string) {
  if (!url) {
    return false
  }
  return (
    url.includes('/api/auth/login') ||
    url.includes('/api/auth/register') ||
    url.includes('/api/auth/send-code') ||
    url.includes('/api/auth/reset-password') ||
    url.includes('/api/auth/refresh')
  )
}

function toLoginPath() {
  if (typeof window === 'undefined') {
    return
  }
  const currentPath = window.location.pathname
  if (currentPath === '/login') {
    return
  }
  const params = new URLSearchParams(window.location.search)
  const desktopClient = params.get('client')
  window.location.href = desktopClient === 'desktop' ? '/login?client=desktop' : '/login'
}

async function refreshSessionIfNeeded() {
  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = (async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY)
      if (!token) {
        return false
      }
      await http.post('/api/auth/refresh', null, {
        _skipAuthRefresh: true
      } as RetryableRequestConfig)
      return true
    } catch {
      clearAuthStorage()
      toLoginPath()
      return false
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  async (response: any) => {
    const result = response.data as AjaxResult<unknown>
    const requestConfig = (response.config || {}) as RetryableRequestConfig
    if (!result || typeof result.code !== 'number') {
      return response as any
    }
    if (result.code === UNAUTHORIZED_CODE) {
      if (requestConfig._skipAuthRedirect) {
        return Promise.reject(new Error(result.msg || '登录状态已失效'))
      }
      const shouldTryRefresh =
        !requestConfig._retry &&
        !requestConfig._skipAuthRefresh &&
        !isAuthEndpoint(requestConfig.url)
      if (shouldTryRefresh) {
        const refreshed = await refreshSessionIfNeeded()
        if (refreshed) {
          return http({
            ...response.config,
            _retry: true
          } as RetryableRequestConfig)
        }
      }
      clearAuthStorage()
      toLoginPath()
      return Promise.reject(new Error(result.msg || '登录状态已失效'))
    }
    if (result.code !== SUCCESS_CODE) {
      ElMessage.error(result.msg || '请求失败')
      return Promise.reject(new Error(result.msg || '请求失败'))
    }
    return result as any
  },
  (error) => {
    const status = error?.response?.status
    const requestConfig = (error?.config || {}) as RetryableRequestConfig
    if (requestConfig._skipAuthRedirect) {
      return Promise.reject(error)
    }
    if (status === UNAUTHORIZED_CODE) {
      clearAuthStorage()
      toLoginPath()
    }
    return Promise.reject(error)
  }
)

export default http
