import type { FileItem, SidebarKey } from './types'

function hashStringToInt(input: string): number {
  let h = 0
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

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
  // 中文：当前后端未提供文件接口，这里先按不同菜单返回可预测的 mock（便于后续替换为真实 API）。
  // 截图为 No Data，我们默认返回空数组；如要联调 UI，可改为 return mockSomeFiles(key)。
  void key
  return []
}

export function mockSomeFiles(seed: string, count = 12): FileItem[] {
  const base = hashStringToInt(seed)
  const now = Date.now()
  return Array.from({ length: count }).map((_, i) => {
    const id = `${base}-${i}`
    const isFolder = (base + i) % 5 === 0
    const updatedAt = new Date(now - (i + 1) * 3600_000).toISOString().slice(0, 19).replace('T', ' ')
    return {
      id,
      name: isFolder ? `新建文件夹${i + 1}` : `文件_${i + 1}.mp4`,
      updatedAt,
      owner: 'VALOR',
      kind: isFolder ? 'folder' : 'file',
      sizeBytes: isFolder ? null : 1024 * 1024 * ((base % 7) + i + 1),
    }
  })
}

