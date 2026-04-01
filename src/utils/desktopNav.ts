import type { LocationQuery, Router } from 'vue-router'

import { preserveDesktopClientQuery } from '@/utils/desktopBridge'

function mergeDesktopQuery(
  currentQuery: LocationQuery,
  extra?: Record<string, string>
): Record<string, string> {
  return { ...preserveDesktopClientQuery(currentQuery), ...extra }
}

/**
 * 登录/注册/重置密码页：在路由跳转时保留桌面端 query（?client=desktop）。
 */
export function pushWithDesktopQuery(
  router: Router,
  currentQuery: LocationQuery,
  path: string,
  extraQuery?: Record<string, string>
): Promise<void | unknown> {
  const q = mergeDesktopQuery(currentQuery, extraQuery)
  return router.push(Object.keys(q).length ? { path, query: q } : path)
}

