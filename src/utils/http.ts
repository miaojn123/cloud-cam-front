import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { refreshApi } from '@/api/auth'
import { useUndoRedo } from '@/composables/undoRedo/useUndoRedo'

export interface AjaxResult<T = unknown> {
  code: number
  msg: string
  data?: T
}

const SUCCESS_CODE = 200
const UNAUTHORIZED_CODE = 401
const REQUEST_FAILED_MSG = '请求失败'
const AUTH_EXPIRED_MSG = '登录状态已失效'
export const TOKEN_KEY = 'auth_token'
const AUTH_ENDPOINT_WHITELIST = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/send-code',
  '/api/auth/reset-password',
  '/api/auth/refresh'
]
const UNDO_REDO_TRIGGER_WHITELIST = ['/api/workspace/addModel']

type RetryableRequestConfig = {
  url?: string
  _retry?: boolean
  _skipAuthRefresh?: boolean
  _skipAuthRedirect?: boolean
  _skipUndoRedoSync?: boolean
}

type BusinessResponse = AxiosResponse<AjaxResult<unknown>>

type BusinessResponseInterceptor = (
  response: BusinessResponse
) => Promise<AjaxResult<unknown> | BusinessResponse>

type AxiosResponseInterceptorCompatible = (
  value: AxiosResponse
) => AxiosResponse | Promise<AxiosResponse>

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 600000
})

let refreshPromise: Promise<boolean> | null = null
const undoRedo = useUndoRedo()

/** 清理本地登录 token。 */
function clearAuthStorage() {
  localStorage.removeItem(TOKEN_KEY)
}

function readAuthToken() {
  return localStorage.getItem(TOKEN_KEY)
}

/** 判断当前请求是否为认证相关接口。 */
function isAuthEndpoint(url?: string) {
  if (!url) {
    return false
  }
  return AUTH_ENDPOINT_WHITELIST.some((endpoint) => url.includes(endpoint))
}

/** 判断当前请求是否命中撤销重做栈自动刷新白名单。 */
function shouldSyncUndoRedoStack(url?: string) {
  if (!url || url.includes('/api/workspace/getUndoRedoStack')) {
    return false
  }
  return UNDO_REDO_TRIGGER_WHITELIST.some((endpoint) => url.includes(endpoint))
}

/** 异步拉取最新撤销/重做栈（不阻塞当前接口返回）。 */
async function triggerUndoRedoStackSync() {
  try {
    return await undoRedo.syncUndoRedoStack()
  } catch {
    return null
  }
}

/** 跳转到登录页（兼容桌面嵌入参数）。 */
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

function createAuthExpiredError(msg?: string) {
  return new Error(msg || AUTH_EXPIRED_MSG)
}

function getRequestConfig(config?: unknown): RetryableRequestConfig {
  return (config || {}) as RetryableRequestConfig
}

function shouldTryAuthRefresh(config: RetryableRequestConfig) {
  return !config._retry && !config._skipAuthRefresh && !isAuthEndpoint(config.url)
}

function handleAuthExpiredRedirect() {
  clearAuthStorage()
  toLoginPath()
}

/** 在 401 场景下尝试刷新会话（同一时刻只发起一次刷新请求）。 */
async function refreshSessionIfNeeded() {
  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = (async () => {
    try {
      const token = readAuthToken()
      if (!token) {
        return false
      }
      await refreshApi({
        _skipAuthRefresh: true,
        _skipAuthRedirect: true
      })
      return true
    } catch {
      handleAuthExpiredRedirect()
      return false
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

function retryRequestWithRefresh(response: BusinessResponse) {
  return http({
    ...response.config,
    _retry: true
  } as RetryableRequestConfig)
}

async function handleUnauthorizedResult(
  response: BusinessResponse,
  result: AjaxResult<unknown>,
  requestConfig: RetryableRequestConfig
) {
  if (requestConfig._skipAuthRedirect) {
    return Promise.reject(createAuthExpiredError(result.msg))
  }
  if (shouldTryAuthRefresh(requestConfig)) {
    const refreshed = await refreshSessionIfNeeded()
    if (refreshed) {
      return retryRequestWithRefresh(response)
    }
  }
  handleAuthExpiredRedirect()
  return Promise.reject(createAuthExpiredError(result.msg))
}

function handleBusinessFailure(result: AjaxResult<unknown>) {
  const msg = result.msg || REQUEST_FAILED_MSG
  ElMessage.error(msg)
  return Promise.reject(new Error(msg))
}

/** 请求拦截：统一注入 Authorization 头。 */
const onRequest = (config: InternalAxiosRequestConfig) => {
  const token = readAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}

/** 响应拦截：统一处理业务码、401 自动刷新与登录态失效跳转。 */
const onResponseSuccess: BusinessResponseInterceptor = async (response) => {
  const result = response.data as AjaxResult<unknown>
  const requestConfig = getRequestConfig(response.config)

  if (!result || typeof result.code !== 'number') {
    return response
  }

  if (result.code === UNAUTHORIZED_CODE) {
    return handleUnauthorizedResult(response, result, requestConfig)
  }

  if (result.code !== SUCCESS_CODE) {
    return handleBusinessFailure(result)
  }

  if (!requestConfig._skipUndoRedoSync && shouldSyncUndoRedoStack(requestConfig.url)) {
    void triggerUndoRedoStackSync()
  }

  return result
}

const onResponseError = (error: AxiosError) => {
  const status = error?.response?.status
  const requestConfig = getRequestConfig(error?.config)

  if (!requestConfig._skipAuthRedirect && status === UNAUTHORIZED_CODE) {
    handleAuthExpiredRedirect()
  }

  return Promise.reject(error)
}

http.interceptors.request.use(onRequest)
http.interceptors.response.use(
  onResponseSuccess as unknown as AxiosResponseInterceptorCompatible,
  onResponseError
)

export default http
