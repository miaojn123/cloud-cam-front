import type { FileItem, SidebarKey } from './types'
import { TEST_DATA_BY_SIDEBAR_KEY } from './test-data'

export function formatBytes(sizeBytes: number | null): string {
  if (sizeBytes == null) return '-'
  if (sizeBytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB'] as const
  const idx = Math.min(Math.floor(Math.log(sizeBytes) / Math.log(1024)), units.length - 1)
  const value = sizeBytes / Math.pow(1024, idx)
  const digits = idx === 0 ? 0 : value >= 10 ? 1 : 2
  return `${value.toFixed(digits)} ${units[idx]}`
}

export function filterFilesByQuery(files: FileItem[], query: string): FileItem[] {
  const q = String(query ?? '').trim().toLowerCase()
  if (!q) return files
  return files.filter((f) => f.name.toLowerCase().includes(q))
}

export function mockFilesForSidebar(key: SidebarKey): FileItem[] {
  return TEST_DATA_BY_SIDEBAR_KEY[key] ?? []
}

