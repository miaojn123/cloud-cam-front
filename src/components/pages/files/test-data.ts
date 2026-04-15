import type { FileItem, SidebarKey } from './types'

const now = new Date()

function isoMinusDays(days: number): string {
  const d = new Date(now)
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

function f(
  id: string,
  name: string,
  daysAgo: number,
  owner: string,
  kind: FileItem['kind'],
  sizeBytes: number | null
): FileItem {
  return { id, name, updatedAt: isoMinusDays(daysAgo), owner, kind, sizeBytes }
}

// 用于开发阶段的假数据：按菜单提供不同列表，便于验证“列/右键菜单/行行为”差异
export const TEST_DATA_BY_SIDEBAR_KEY: Readonly<Record<SidebarKey, FileItem[]>> = {
  recent: [
    f('r-1', '需求文档-迭代计划.md', 0, '你', 'file', 12_340),
    f('r-2', '截图/会议纪要', 1, '你', 'folder', null),
    f('r-3', 'cloud-cam-设计稿.fig', 2, 'UI', 'file', 8_923_120),
  ],
  personal: [
    f('p-1', '个人/周报/2026-W14.md', 1, '你', 'file', 4_210),
    f('p-2', '个人/发票', 10, '你', 'folder', null),
    f('p-3', '本地备份.zip', 30, '你', 'file', 51_203_887),
  ],
  team: [
    f('t-1', '团队/项目计划', 0, 'PM', 'folder', null),
    f('t-2', '团队/接口约定.xlsx', 3, '后端', 'file', 233_120),
    f('t-3', '团队/部署手册.md', 7, '运维', 'file', 18_222),
  ],
  sharedByMe: [
    f('s-1', '共享/给测试的安装包.zip', 0, '你', 'file', 210_003_120),
    f('s-2', '共享/演示视频.mp4', 5, '你', 'file', 1_024_000_000),
  ],
  sharedToMe: [
    f('st-1', '他人共享/相机标定数据.csv', 1, 'Alice', 'file', 120_001),
    f('st-2', '他人共享/产品宣传图', 2, 'Bob', 'folder', null),
  ],
  trash: [
    f('x-1', '已删除/旧版文档.docx', 2, '你', 'file', 88_880),
    f('x-2', '已删除/临时文件夹', 9, '你', 'folder', null),
  ],
} as const

