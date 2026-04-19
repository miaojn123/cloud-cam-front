import { defineStore } from 'pinia'
import { TOKEN_KEY } from '@/utils/http'
import type { CurrentUser } from '@/types/user'
import { useCurrentUser, type FetchCurrentUserOptions } from '@/composables/user/useCurrentUser'
import { useUserAuth } from '@/composables/user/useUserAuth'

// 用户信息仅存内存，不再缓存到 localStorage。
// 启动恢复时若有 token，直接从后端拉最新用户数据，确保头像等字段始终最新。

interface UserState {
  /** 当前登录 token（持久化到 localStorage） */
  token: string
  /** 当前登录用户信息（仅内存态） */
  user: CurrentUser | null
}

const userAuth = useUserAuth()
const currentUser = useCurrentUser()
let fetchCurrentUserPromise: Promise<CurrentUser | null> | null = null

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    /** 登录态 token，页面刷新后从本地恢复 */
    token: localStorage.getItem(TOKEN_KEY) || '',
    /** 当前用户详情，按需拉取 */
    user: null
  }),
  actions: {
    /** 设置 token 并写入本地存储。 */
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
    /** 发送登录验证码。 */
    async sendLoginCode(account: string) {
      return userAuth.sendLoginCode(account)
    },
    /** 发送注册验证码。 */
    async sendRegisterCode(account: string) {
      return userAuth.sendRegisterCode(account)
    },
    /** 发送重置密码验证码。 */
    async sendResetCode(account: string) {
      return userAuth.sendResetCode(account)
    },
    /** 账号密码登录并保存 token。 */
    async loginByPassword(account: string, password: string) {
      return userAuth.loginByPassword(account, password, (token) => this.setToken(token))
    },
    /** 验证码登录并保存 token。 */
    async loginByCode(account: string, code: string) {
      return userAuth.loginByCode(account, code, (token) => this.setToken(token))
    },
    /** 验证码注册。 */
    async registerByCode(account: string, code: string, password: string, username: string) {
      return userAuth.registerByCode(account, code, password, username)
    },
    /** 用户名注册。 */
    async registerByUsername(username: string, password: string) {
      return userAuth.registerByUsername(username, password)
    },
    /** 重置密码。 */
    async resetPassword(account: string, code: string, newPassword: string) {
      return userAuth.resetPassword(account, code, newPassword)
    },
    /** 拉取当前用户信息（并发场景下复用同一请求）。 */
    async fetchCurrentUser(options?: FetchCurrentUserOptions) {
      if (fetchCurrentUserPromise) {
        return fetchCurrentUserPromise
      }
      fetchCurrentUserPromise = currentUser
        .fetchCurrentUser(options)
        .then((user) => {
          this.user = user
          return user
        })
        .finally(() => {
          fetchCurrentUserPromise = null
        })
      return fetchCurrentUserPromise
    },
    /** 仅更新头像字段，避免全量重拉用户信息。 */
    updateAvatar(avatar: string) {
      if (!this.user) return
      this.user = { ...this.user, avatar }
    },
    /** 退出登录并清理本地登录态。 */
    async logout() {
      await userAuth.logout(() => this.clearAuth())
    }
  }
})
