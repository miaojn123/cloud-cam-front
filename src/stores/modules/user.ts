import { defineStore } from 'pinia'
import { TOKEN_KEY } from '@/api'
import type { CurrentUser } from '@/types/user'
import { useCurrentUser, type FetchCurrentUserOptions } from '@/composables/user/useCurrentUser'
import { useUserAuth } from '@/composables/user/useUserAuth'

// 用户信息仅存内存，不再缓存到 localStorage。
// 启动恢复时若有 token，直接从后端拉最新用户数据，确保头像等字段始终最新。

interface UserState {
  token: string
  user: CurrentUser | null
}

const userAuth = useUserAuth()
const currentUser = useCurrentUser()

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: localStorage.getItem(TOKEN_KEY) || '',
    user: null
  }),
  actions: {
    setToken(token: string) {
      this.token = token
      localStorage.setItem(TOKEN_KEY, token)
    },
    /** Qt 主窗在 Vue 已挂载后注入 token 时可调用（与仅写 localStorage 后刷新二选一） */
    clearAuth() {
      this.token = ''
      this.user = null
      localStorage.removeItem(TOKEN_KEY)
    },
    async sendLoginCode(account: string) {
      return userAuth.sendLoginCode(account)
    },
    async sendRegisterCode(account: string) {
      return userAuth.sendRegisterCode(account)
    },
    async sendResetCode(account: string) {
      return userAuth.sendResetCode(account)
    },
    async loginByPassword(account: string, password: string) {
      return userAuth.loginByPassword(account, password, (token) => this.setToken(token))
    },
    async loginByCode(account: string, code: string) {
      return userAuth.loginByCode(account, code, (token) => this.setToken(token))
    },
    async registerByCode(account: string, code: string, password: string, username: string) {
      return userAuth.registerByCode(account, code, password, username)
    },
    async registerByUsername(username: string, password: string) {
      return userAuth.registerByUsername(username, password)
    },
    async resetPassword(account: string, code: string, newPassword: string) {
      return userAuth.resetPassword(account, code, newPassword)
    },
    async fetchCurrentUser(options?: FetchCurrentUserOptions) {
      this.user = await currentUser.fetchCurrentUser(options)
      return this.user
    },
    updateAvatar(avatar: string) {
      if (!this.user) return
      this.user = { ...this.user, avatar }
    },
    async logout() {
      await userAuth.logout(() => this.clearAuth())
    }
  }
})
