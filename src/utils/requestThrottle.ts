import { throttle } from 'lodash'

/** 发送验证码、提交表单等按钮的节流间隔（毫秒） */
export const REQUEST_BUTTON_THROTTLE_MS = 1200

/** leading：首次立即执行；trailing：窗口内末尾不补发 */
export function requestButtonThrottle<T extends (...args: unknown[]) => unknown>(fn: T): T {
  return throttle(fn, REQUEST_BUTTON_THROTTLE_MS, {
    leading: true,
    trailing: false,
  }) as unknown as T
}
