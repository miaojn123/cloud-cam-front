import type { LocationQuery } from 'vue-router'
import type { CurrentUser } from '@/types/user'

/**
 * Qt/QCefView 需在页面上下文中注入：
 *   window.__DESKTOP_QT__ = { onLoginSuccess(payload) { ... } }
 * payload.token 由前端登录态提供，供 Qt 在登录成功后更新桌面端会话。
 */
export const DESKTOP_QT_BRIDGE = '__DESKTOP_QT__' as const

export const DESKTOP_CLIENT_PARAM = 'client'
export const DESKTOP_CLIENT_VALUE = 'desktop'

/** 外置浏览器首跳注入登录态时与 CamDemo 约定的 query 键（与 localStorage 写入后须从地址栏移除） */
export const EXTERNAL_AUTH_TOKEN_QUERY_PARAM = 'token'

/** 从路由 query 解析外跳传入的 token，空则视为未携带 */
export function pickExternalAuthTokenFromQuery(query: LocationQuery): string {
  const raw = query[EXTERNAL_AUTH_TOKEN_QUERY_PARAM]
  const v = Array.isArray(raw) ? raw[0] : raw
  if (typeof v !== 'string') return ''
  return v.trim()
}

/** 生成不含 token 的 query，供 replace 后避免敏感信息留在历史记录 */
export function omitExternalAuthTokenFromQuery(query: LocationQuery): LocationQuery {
  const next: LocationQuery = { ...query }
  delete next[EXTERNAL_AUTH_TOKEN_QUERY_PARAM]
  return next
}

export interface DesktopLoginPayload {
  token: string
  /** 与 /api/user/current 的 user 一致，随后端扩展字段自动携带 */
  user: CurrentUser
}

/** 深拷贝为纯 JSON 对象，避免响应式代理在 Qt 桥接下序列化异常 */
export function cloneUserForDesktopBridge(user: CurrentUser): CurrentUser {
  return JSON.parse(JSON.stringify(user)) as CurrentUser
}

export interface DesktopHostBridge {
  onLoginSuccess?(payload: DesktopLoginPayload): void
}

function getQtBridge(): DesktopHostBridge | undefined {
  if (typeof window === 'undefined') return undefined
  const w = window as unknown as Record<string, unknown>
  const bridge = w[DESKTOP_QT_BRIDGE]
  if (typeof bridge === 'object' && bridge !== null) {
    return bridge as DesktopHostBridge
  }
  return undefined
}

/** URL ?client=desktop 或已注入桥时视为桌面嵌入模式 */
export function isDesktopEmbed(query?: LocationQuery): boolean {
  const raw = query?.[DESKTOP_CLIENT_PARAM]
  const v = Array.isArray(raw) ? raw[0] : raw
  if (v === DESKTOP_CLIENT_VALUE) return true
  return getQtBridge() !== undefined
}

/**
 * 登录成功后通知 Qt；返回 true 表示已交给原生处理（可不再做 SPA 跳转）。
 */
export function notifyDesktopLoginSuccess(payload: DesktopLoginPayload): boolean {
  const bridge = getQtBridge()
  if (bridge && typeof bridge.onLoginSuccess === 'function') {
    try {
      // 关键桥接调用需兜底，避免原生侧异常反向打断前端登录流程。
      bridge.onLoginSuccess(payload)
      return true
    } catch (error) {
      console.error('[DesktopBridge] onLoginSuccess failed:', error)
      return false
    }
  }
  return false
}

/** 从 /login 跳到注册/找回密码时保留 ?client=desktop */
export function preserveDesktopClientQuery(query: LocationQuery): Record<string, string> {
  const raw = query[DESKTOP_CLIENT_PARAM]
  const v = Array.isArray(raw) ? raw[0] : raw
  if (v !== DESKTOP_CLIENT_VALUE) return {}
  return { [DESKTOP_CLIENT_PARAM]: DESKTOP_CLIENT_VALUE }
}
