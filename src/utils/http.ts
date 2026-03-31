import axios from 'axios'

export interface AjaxResult<T = unknown> {
  code: number
  msg: string
  data?: T
}

const SUCCESS_CODE = 200
export const TOKEN_KEY = 'auth_token'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 15000
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response: any) => {
    const result = response.data as AjaxResult<unknown>
    if (!result || typeof result.code !== 'number') {
      return response as any
    }
    if (result.code !== SUCCESS_CODE) {
      ElMessage.error(result.msg || '请求失败')
      return Promise.reject(new Error(result.msg || '请求失败'))
    }
    return result as any
  },
  (error) => Promise.reject(error)
)

export default http
