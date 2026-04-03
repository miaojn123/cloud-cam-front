import type { FormItemRule, FormRules } from 'element-plus'

/** 国内 11 位手机号，与接口文档 ^1\\d{10}$ 一致 */
export const PATTERN_CN_PHONE = /^1\d{10}$/

/** 常见邮箱形态（与绑定邮箱等页面一致） */
export const PATTERN_EMAIL_LOOSE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** 用户名：英文开头，仅字母/数字/下划线（长度另用 min/max） */
export const PATTERN_USER_NAME = /^[A-Za-z][A-Za-z0-9_]*$/

/**
 * 注册/匿名重置密码：8～20 位，至少字母与数字，且仅字母数字（与既有 passwordPolicy 行为一致）。
 */
const PATTERN_PASSWORD_REGISTER_OR_RESET = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/

/**
 * 已登录修改密码：与后端 AccountResetPasswordRequest.newPassword 一致（8～20，含字母与数字，中间字符不限）。
 */
const PATTERN_PASSWORD_LOGGED_IN_NEW = /^(?=.*[A-Za-z])(?=.*\d).+$/

export function isCnMobilePhone(value: string): boolean {
  return PATTERN_CN_PHONE.test(String(value ?? '').trim())
}

export function isEmailFormat(value: string): boolean {
  return PATTERN_EMAIL_LOOSE.test(String(value ?? '').trim())
}

/** 修改资料用户名：6～20 且符合 PATTERN_USER_NAME */
export function isUserNameFormat(value: string): boolean {
  const t = String(value ?? '').trim()
  if (t.length < 6 || t.length > 20) return false
  return PATTERN_USER_NAME.test(t)
}

/** 注册页可选用户名：空通过；非空须 6～20 且符合规则 */
export function isRegisterOptionalUserNameValid(value: string): boolean {
  const v = String(value ?? '').trim()
  if (!v) return true
  return isUserNameFormat(v)
}

export function isRegisterPasswordValid(password: string): boolean {
  return PATTERN_PASSWORD_REGISTER_OR_RESET.test(password)
}

export function isResetPasswordValid(password: string): boolean {
  return PATTERN_PASSWORD_REGISTER_OR_RESET.test(password)
}

export function isNewPasswordForLoggedInChange(password: string): boolean {
  const t = String(password ?? '').trim()
  if (t.length < 8 || t.length > 20) return false
  return PATTERN_PASSWORD_LOGGED_IN_NEW.test(t)
}

/** 找回密码页 account：邮箱或国内手机号 */
export function isEmailOrCnPhoneAccount(value: string): boolean {
  const s = String(value ?? '').trim()
  if (!s) return false
  return isEmailFormat(s) || isCnMobilePhone(s)
}

// —— 文案：供表单 rules 与手动校验共用 ——

export const Msg = {
  cnPhone: '请输入正确手机号',
  email: '请输入正确邮箱',
  emailOrPhone: '请输入正确的邮箱或手机号',
  userName: '用户名需 6-20 位，英文开头，仅字母数字下划线',
  userNameRequired: '用户名不能为空',
  userNameLength: '用户名长度应为 6-20 个字符',
  userNamePattern: '用户名需英文开头，仅支持字母/数字/下划线',
  passwordRegister: '密码需为 8-20 位，且至少包含一个数字和一个字母',
  oldPasswordRequired: '请输入原密码',
  oldPasswordLength: '原密码长度需在 8～20 位',
  newPasswordRequired: '请输入新密码',
  newPasswordStrength: '新密码需 8～20 位，且同时包含字母和数字',
  newPasswordSameAsOld: '新密码不能与原密码相同',
  confirmNewPassword: '请再次输入新密码',
  confirmNewPasswordMismatch: '两次输入的新密码不一致',
} as const

/** 个人资料：用户名（必填修改） */
export const userNameFormRules: FormItemRule[] = [
  { required: true, message: Msg.userNameRequired, trigger: 'blur' },
  { min: 6, max: 20, message: Msg.userNameLength, trigger: 'blur' },
  {
    pattern: PATTERN_USER_NAME,
    message: Msg.userNamePattern,
    trigger: 'blur',
  },
]

export type ChangePasswordFormModel = {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

/** 修改密码弹窗：在 created 中 `this.rules = buildChangePasswordFormRules(() => this.form)` */
export function buildChangePasswordFormRules(
  getForm: () => ChangePasswordFormModel
): FormRules<ChangePasswordFormModel> {
  return {
    oldPassword: [
      { required: true, message: Msg.oldPasswordRequired, trigger: ['blur', 'change'] },
      {
        type: 'string',
        min: 8,
        max: 20,
        message: Msg.oldPasswordLength,
        trigger: ['blur', 'change'],
      },
    ],
    newPassword: [
      {
        validator: (_rule, value, callback) => {
          const p = String(value ?? '').trim()
          if (!p) {
            callback(new Error(Msg.newPasswordRequired))
            return
          }
          if (!isNewPasswordForLoggedInChange(p)) {
            callback(new Error(Msg.newPasswordStrength))
            return
          }
          if (p === String(getForm().oldPassword ?? '')) {
            callback(new Error(Msg.newPasswordSameAsOld))
            return
          }
          callback()
        },
        trigger: ['blur', 'change'],
      },
    ],
    confirmPassword: [
      {
        validator: (_rule, value, callback) => {
          const c = String(value ?? '').trim()
          const n = String(getForm().newPassword ?? '').trim()
          if (!c) {
            callback(new Error(Msg.confirmNewPassword))
            return
          }
          if (c !== n) {
            callback(new Error(Msg.confirmNewPasswordMismatch))
            return
          }
          callback()
        },
        trigger: ['blur', 'change'],
      },
    ],
  }
}
