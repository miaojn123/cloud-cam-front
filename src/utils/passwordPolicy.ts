/**
 * 注册：明文密码 8～20 位，至少包含字母与数字（与注册接口约定一致）。
 */
const REGISTER_PASSWORD = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/

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
