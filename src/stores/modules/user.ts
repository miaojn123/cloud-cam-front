import { defineStore } from 'pinia'
import { TOKEN_KEY } from '@/api'
import {
  loginByCodeApi,
  loginByPasswordApi,
  logoutApi,
  registerByCodeApi,
  sendCodeApi
} from '@/api/auth'
import { getCurrentUserApi, type CurrentUser } from '@/api/user'

// 缓存当前用户“展示所需”的最小字段（供桌面端/启动探测使用）
// 说明：桌面端启动探测应尽量不依赖网络请求（CEF 环境下 fetch/代理可能不稳定）。
const CURRENT_USER_CACHE_KEY = 'current_user_cache' as const

type CurrentUserCache = {
  uuid: string
  nickName: string
  userName: string
  email: string
  phone: string
  sex: number
  avatar: string
  role: number
}

function setCurrentUserCache(user: CurrentUser | null) {
  if (!user) {
    localStorage.removeItem(CURRENT_USER_CACHE_KEY)
    return
  }
  const cache: CurrentUserCache = {
    uuid: user.uuid || '',
    nickName: user.nickName || '',
    userName: user.userName || '',
    email: user.email || '',
    phone: user.phone || '',
    sex: typeof user.sex === 'number' ? user.sex : 0,
    avatar: user.avatar || '',
    role: typeof user.role === 'number' ? user.role : 0
  }
  localStorage.setItem(CURRENT_USER_CACHE_KEY, JSON.stringify(cache))
}

function clearCurrentUserCache() {
  localStorage.removeItem(CURRENT_USER_CACHE_KEY)
}

interface UserState {
  loading: boolean
  token: string
  currentUser: CurrentUser | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    loading: false,
    token: localStorage.getItem(TOKEN_KEY) || '',
    currentUser: null
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
      this.currentUser = null
      localStorage.removeItem(TOKEN_KEY)
      clearCurrentUserCache()
    },
    async sendLoginCode(account: string) {
      return sendCodeApi(account, 'LOGIN')
    },
    async sendRegisterCode(account: string) {
      return sendCodeApi(account, 'REGISTER')
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
    async fetchCurrentUser() {
      const result = await getCurrentUserApi()
      this.currentUser = result.data?.user || null
      // 仅缓存展示字段，降低耦合与敏感数据落盘风险
      setCurrentUserCache(this.currentUser)
      return this.currentUser
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
