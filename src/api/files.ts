import http, { type AjaxResult } from '@/utils/http'
import type { AxiosRequestConfig } from 'axios'
import type { FileItem, SidebarKey } from '@/components/pages/files/types'
import { TEST_DATA_BY_SIDEBAR_KEY } from '@/components/pages/files/test-data'

type FilesRequestConfig = AxiosRequestConfig & {
  _skipAuthRedirect?: boolean
}

/** 统一发送文件模块 POST 请求。 */
function postFileApi<TResponse = unknown, TPayload = unknown>(
  path: string,
  payload?: TPayload,
  config?: FilesRequestConfig
) {
  return http({
    url: path,
    method: 'post',
    ...(payload === undefined ? {} : { data: payload }),
    ...config
  }) as Promise<AjaxResult<TResponse>>
}

const FILES_BASE = '/api/files'
const MOCK_DELAY_MS = 150

export type FilesListResponse = {
  files: FileItem[]
}

function cloneFiles(files: readonly FileItem[]): FileItem[] {
  return files.map((item) => ({ ...item }))
}

function buildFilesListResponse(sidebarKey: SidebarKey): FilesListResponse {
  return {
    files: cloneFiles(TEST_DATA_BY_SIDEBAR_KEY[sidebarKey] || [])
  }
}

function mockPostFilesApi(
  sidebarKey: SidebarKey
): Promise<AjaxResult<FilesListResponse>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        msg: 'ok',
        data: buildFilesListResponse(sidebarKey)
      })
    }, MOCK_DELAY_MS)
  })
}

export type GetFilesRequest = {
  parentUuid: string
}

/** 获取指定目录下的文件列表。 */
export function getFilesApi(request: GetFilesRequest, config?: FilesRequestConfig) {
  return postFileApi(`${FILES_BASE}/getFiles`, request, config)
}

/** 最近文件列表。 */
export function getRecentFilesApi() {
  return mockPostFilesApi('recent')
}

/** 个人文件列表。 */
export function getPersonalFilesApi() {
  return mockPostFilesApi('personal')
}

/** 团队文件列表。 */
export function getTeamFilesApi() {
  return mockPostFilesApi('team')
}

/** 我分享的文件列表。 */
export function getSharedByMeFilesApi() {
  return mockPostFilesApi('sharedByMe')
}

/** 我收到的文件列表。 */
export function getSharedToMeFilesApi() {
  return mockPostFilesApi('sharedToMe')
}

/** 回收站文件列表。 */
export function getTrashFilesApi() {
  return mockPostFilesApi('trash')
}
