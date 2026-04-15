import { request } from './request'
import type { AxiosRequestConfig } from 'axios'

type FilesRequestConfig = AxiosRequestConfig & {
    _skipAuthRedirect?: boolean
}

function postFileApi<TResponse = unknown, TPayload = unknown>(
    path: string,
    payload?: TPayload,
    config?: FilesRequestConfig
) {
    return request<TResponse>({
        url: path,
        method: 'post',
        ...(payload === undefined ? {} : { data: payload }),
        ...config
    })
}

export type GetFilesRequest = {
    parentUuid: string
}

export function getFilesApi(parentUuid: string, config?: FilesRequestConfig) {
    return postFileApi('/getFiles', { parentUuid }, config)
}
