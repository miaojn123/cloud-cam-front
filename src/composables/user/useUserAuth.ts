import {
    loginByCodeApi,
    loginByPasswordApi,
    logoutApi,
    registerByCodeApi,
    registerByUsernameApi,
    resetPasswordApi,
    sendCodeApi
} from '@/api/auth'

type SetTokenHandler = (token: string) => void
type ClearAuthHandler = () => void

/** 确保登录接口返回了可用 token。 */
function ensureToken(token: string) {
    if (!token) {
        throw new Error('登录成功但未返回 token')
    }
    return token
}

/** 用户鉴权相关流程（登录、注册、验证码、登出）。 */
export function useUserAuth() {
    return {
        /** 发送登录验证码。 */
        sendLoginCode(account: string) {
            return sendCodeApi({ account, scene: 'LOGIN' })
        },

        /** 发送注册验证码。 */
        sendRegisterCode(account: string) {
            return sendCodeApi({ account, scene: 'REGISTER' })
        },

        /** 发送重置密码验证码。 */
        sendResetCode(account: string) {
            return sendCodeApi({ account, scene: 'RESET_PASSWORD' })
        },

        /** 账号密码登录并回写 token。 */
        async loginByPassword(account: string, password: string, setToken: SetTokenHandler) {
            const result = await loginByPasswordApi({ account, password })
            const token = ensureToken(result.data?.token || '')
            setToken(token)
            return token
        },

        /** 验证码登录并回写 token。 */
        async loginByCode(account: string, code: string, setToken: SetTokenHandler) {
            const result = await loginByCodeApi({ account, code })
            const token = ensureToken(result.data?.token || '')
            setToken(token)
            return token
        },

        /** 通过账号+验证码完成注册。 */
        registerByCode(account: string, code: string, password: string, username: string) {
            return registerByCodeApi({ account, code, password, username })
        },

        /** 通过用户名+密码完成注册。 */
        registerByUsername(username: string, password: string) {
            return registerByUsernameApi({ username, password })
        },

        /** 通过验证码重置密码。 */
        resetPassword(account: string, code: string, newPassword: string) {
            return resetPasswordApi({ account, code, newPassword })
        },

        /** 退出登录并清理本地登录态。 */
        async logout(clearAuth: ClearAuthHandler) {
            try {
                await logoutApi()
            } finally {
                clearAuth()
            }
        }
    }
}
