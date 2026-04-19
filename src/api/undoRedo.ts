import http, { type AjaxResult } from '@/utils/http'
import type { AxiosRequestConfig } from 'axios'

type UndoRedoRequestConfig = AxiosRequestConfig & {
  _skipAuthRedirect?: boolean
  _skipUndoRedoSync?: boolean
}

const WORKSPACE_BASE = '/api/workspace'

/** 统一发送撤销重做模块 POST 请求。 */
function postUndoRedoApi<TResponse = unknown, TPayload = unknown>(
  path: string,
  payload?: TPayload,
  config?: UndoRedoRequestConfig
) {
  return http({
    url: `${WORKSPACE_BASE}${path}`,
    method: 'post',
    ...(payload === undefined ? {} : { data: payload }),
    ...config
  }) as Promise<AjaxResult<TResponse>>
}

export interface UndoRedoStackResponse {
  undoStack: unknown[]
  redoStack: unknown[]
}

/** 获取当前工作区撤销重做栈。 */
export function getUndoRedoStackApi(config?: UndoRedoRequestConfig) {
  return postUndoRedoApi<UndoRedoStackResponse>('/getUndoRedoStack', undefined, {
    ...config,
    _skipUndoRedoSync: true
  })
}

