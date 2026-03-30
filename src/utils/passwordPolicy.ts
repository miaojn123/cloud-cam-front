/**
 * 新密码格式：仅用于注册、重置密码流程；登录页密码只做非空校验，不调用本模块。
 *
 * 注册：明文密码 8～32 位，至少包含字母与数字（与注册接口约定一致）。
 */
const REGISTER_PASSWORD = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,32}$/

/**
 * 重置密码：POST /api/auth/reset-password，明文 8～32 位，至少包含字母与数字。
 */
const RESET_PASSWORD = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,32}$/

export function isRegisterPasswordValid(password: string): boolean {
  return REGISTER_PASSWORD.test(password)
}

export function isResetPasswordValid(password: string): boolean {
  return RESET_PASSWORD.test(password)
}
