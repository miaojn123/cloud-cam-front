export type ViewMode = 'table' | 'grid'

export type SidebarKey =
  | 'recent'
  | 'personal'
  | 'team'
  | 'sharedByMe'
  | 'sharedToMe'
  | 'trash'

export type FileKind = 'folder' | 'file'

export interface FileItem {
  id: string
  name: string
  updatedAt: string
  owner: string
  kind: FileKind
  sizeBytes: number | null
}

export type { UserSummary } from '@/types/user'

