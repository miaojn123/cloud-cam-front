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
    clearAuth() {
      this.token = ''
      this.currentUser = null
      localStorage.removeItem(TOKEN_KEY)
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
