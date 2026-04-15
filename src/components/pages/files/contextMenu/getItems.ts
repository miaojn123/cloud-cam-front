import type { FileItem, SidebarKey } from '../types'
import type { ContextMenuItem } from './types'

export function getContextMenuItems(key: SidebarKey, row: FileItem): ContextMenuItem[] {
  void row
  switch (key) {
    case 'personal':
      return [
        { id: 'open', label: '打开' },
        { id: 'rename', label: '重命名' },
        { id: 'divider-1', label: '-', divider: true },
        { id: 'delete', label: '移入回收站', danger: true },
      ]
    case 'team':
      return [
        { id: 'open', label: '打开' },
        { id: 'copyLink', label: '复制链接' },
      ]
    case 'sharedByMe':
      return [
        { id: 'shareInfo', label: '分享信息' },
        { id: 'copyLink', label: '复制链接' },
        { id: 'divider-1', label: '-', divider: true },
        { id: 'stopShare', label: '停止分享', danger: true },
      ]
    case 'sharedToMe':
      return [
        { id: 'shareInfo', label: '分享信息' },
        { id: 'saveToPersonal', label: '保存到个人文件' },
      ]
    case 'trash':
      return [
        { id: 'restore', label: '恢复' },
        { id: 'divider-1', label: '-', divider: true },
        { id: 'deleteForever', label: '彻底删除', danger: true },
      ]
    case 'recent':
    default:
      return [{ id: 'open', label: '打开' }]
  }
}
