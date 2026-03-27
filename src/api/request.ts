import http from '@/utils/http'
import type { AxiosRequestConfig } from 'axios'
import type { AjaxResult } from '@/utils/http'

export const request = <T = unknown>(config: AxiosRequestConfig) =>
  http(config) as Promise<AjaxResult<T>>
