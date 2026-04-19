import { defineStore } from 'pinia'
import type { FileItem, SidebarKey } from '@/components/pages/files/types'

interface FilesState {
  /** 当前菜单 key */
  currentKey: SidebarKey
  /** 当前菜单文件列表（每次切换重拉，不做缓存） */
  items: FileItem[]
  /** 当前菜单加载状态 */
  loading: boolean
  /** 当前菜单最近一次错误信息 */
  error: string | null
}

export const useFilesStore = defineStore('files', {
  state: (): FilesState => ({
    /** 当前菜单 */
    currentKey: 'personal',
    /** 当前文件列表 */
    items: [],
    /** 加载态 */
    loading: false,
    /** 错误态 */
    error: null,
  }),
  actions: {
    /** 切换当前菜单。 */
    setCurrentKey(key: SidebarKey) {
      this.currentKey = key
    },
    /** 写入当前菜单文件列表。 */
    setItems(files: FileItem[]) {
      this.items = files
    },
    /** 更新当前菜单加载状态。 */
    setLoading(loading: boolean) {
      this.loading = loading
    },
    /** 更新当前菜单错误信息。 */
    setError(error: string | null) {
      this.error = error
    },
    /** 清空全部文件模块状态。 */
    clearFilesState() {
      this.currentKey = 'personal'
      this.items = []
      this.loading = false
      this.error = null
    },
  },
})
