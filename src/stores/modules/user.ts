import { defineStore } from 'pinia'
import { TOKEN_KEY } from '@/api'
import {
  loginByCodeApi,
  loginByPasswordApi,
  logoutApi,
  registerByCodeApi,
  resetPasswordApi,
  sendCodeApi
} from '@/api/auth'
import { getCurrentUserApi, type CurrentUser } from '@/api/user'

// 用户信息仅存内存，不再缓存到 localStorage。
// 启动恢复时若有 token，直接从后端拉最新用户数据，确保头像等字段始终最新。

interface UserState {
  loading: boolean
  token: string
  user: CurrentUser | null
}

type FetchCurrentUserOptions = {
  skipAuthRedirect?: boolean
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    loading: false,
    token: localStorage.getItem(TOKEN_KEY) || '',
    user: null
  }),
  getters: {
    isLoading(state): boolean {
      return state.loading
    },
    isAuthed(state): boolean {
      return Boolean(state.token)
    }
  },
  actions: {
    setLoading(value: boolean) {
      this.loading = value
    },
    setToken(token: string) {
      this.token = token
      localStorage.setItem(TOKEN_KEY, token)
    },
    /** Qt 主窗在 Vue 已挂载后注入 token 时可调用（与仅写 localStorage 后刷新二选一） */
    async applyExternalToken(token: string) {
      this.setToken(token)
      return this.fetchCurrentUser()
    },
    clearAuth() {
      this.token = ''
      this.user = null
      localStorage.removeItem(TOKEN_KEY)
    },
    async sendLoginCode(account: string) {
      return sendCodeApi(account, 'LOGIN')
    },
    async sendRegisterCode(account: string) {
      return sendCodeApi(account, 'REGISTER')
    },
    async sendResetCode(account: string) {
      // 占位：重置密码验证码场景需与后端约定 scene 字符串
      // 后端若暂未区分场景，也可先沿用 send-code 接口统一发送
      return sendCodeApi(account, 'RESET_PASSWORD')
    },
    async loginByPassword(account: string, password: string) {
      const result = await loginByPasswordApi(account, password)
      const token = result.data?.token || ''
      if (!token) {
        throw new Error('登录成功但未返回 token')
      }
      this.setToken(token)
      return token
    },
    async loginByCode(account: string, code: string) {
      const result = await loginByCodeApi(account, code)
      const token = result.data?.token || ''
      if (!token) {
        throw new Error('登录成功但未返回 token')
      }
      this.setToken(token)
      return token
    },
    async registerByCode(account: string, code: string, password: string, username: string) {
      return registerByCodeApi(account, code, password, username)
    },
    async resetPassword(account: string, code: string, newPassword: string) {
      return resetPasswordApi(account, code, newPassword)
    },
    async fetchCurrentUser(options?: FetchCurrentUserOptions) {
      const result = await getCurrentUserApi({
        _skipAuthRedirect: options?.skipAuthRedirect
      })
      this.user = result.data?.user || null
      return this.user
    },
    updateAvatar(avatar: string) {
      if (!this.user) return
      this.user = { ...this.user, avatar }
    },
    async logout() {
      try {
        await logoutApi()
      } finally {
        this.clearAuth()
      }
    }
  }
})
