import type { LocationQuery } from 'vue-router'

/**
 * Qt/QCefView 需在页面上下文中注入：
 *   window.__DESKTOP_QT__ = { onLoginSuccess(payload) { ... } }
 * payload.token 与 localStorage(TOKEN_KEY) 一致，便于主窗未共享 storage 时由 Qt 写入主窗。
 */
export const DESKTOP_QT_BRIDGE = '__DESKTOP_QT__' as const

export const DESKTOP_CLIENT_PARAM = 'client'
export const DESKTOP_CLIENT_VALUE = 'desktop'

/**
 * 桌面端桥接用户对象（字段与后端 Java 实体一致，便于跨端对齐）
 */
export interface DesktopUser {
  uuid: string
  userName: string
  nickName: string
  email: string
  phone: string
  sex: number
  avatar: string
  role: number
}

export interface DesktopLoginPayload {
  token: string
  user: DesktopUser
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
