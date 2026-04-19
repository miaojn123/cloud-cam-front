import {
  getPersonalFilesApi,
  getRecentFilesApi,
  getSharedByMeFilesApi,
  getSharedToMeFilesApi,
  getTeamFilesApi,
  getTrashFilesApi,
} from '@/api/files'
import type { AjaxResult } from '@/utils/http'
import { useFilesStore } from '@/stores'
import type { FileItem, SidebarKey } from '@/components/pages/files/types'

type FilesApiResult = Promise<AjaxResult<{ files: FileItem[] }>>

function requestBySidebarKey(key: SidebarKey): FilesApiResult {
  switch (key) {
    case 'recent':
      return getRecentFilesApi()
    case 'personal':
      return getPersonalFilesApi()
    case 'team':
      return getTeamFilesApi()
    case 'sharedByMe':
      return getSharedByMeFilesApi()
    case 'sharedToMe':
      return getSharedToMeFilesApi()
    case 'trash':
      return getTrashFilesApi()
    default:
      return getPersonalFilesApi()
  }
}

/** 文件列表相关业务流程。 */
export function useFiles() {
  const filesStore = useFilesStore()

  return {
    /** 按菜单类型拉取文件列表并落入 store。 */
    async fetchFilesBySidebarKey(key: SidebarKey) {
      filesStore.setCurrentKey(key)
      filesStore.setLoading(true)
      filesStore.setError(null)
      try {
        const result = await requestBySidebarKey(key)
        const files = result.data?.files || []
        filesStore.setItems(files)
        return files
      } catch (error) {
        const msg = error instanceof Error ? error.message : '获取文件列表失败'
        filesStore.setError(msg)
        filesStore.setItems([])
        throw error
      } finally {
        filesStore.setLoading(false)
      }
    },
  }
}
