import type { LocationQuery, Router } from 'vue-router'

import { preserveDesktopClientQuery } from '@/utils/desktopBridge'

/**
 * 统一封装：在路由跳转时保留桌面端 query（?client=desktop）。
 * - 中文注释：Qt 内嵌时依赖该 query 识别桌面模式/桥接；Web 端则不需要。
 */
export function pushWithDesktopQuery(
  router: Router,
  currentQuery: LocationQuery,
  path: string
): Promise<void | unknown> {
  const q = preserveDesktopClientQuery(currentQuery)
  return router.push(Object.keys(q).length ? { path, query: q } : path)
}

