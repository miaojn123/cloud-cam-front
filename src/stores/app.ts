import { defineStore } from 'pinia'

interface AppState {
  loading: boolean
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    loading: false
  }),
  getters: {
    isLoading(state): boolean {
      return state.loading
    }
  },
  actions: {
    setLoading(value: boolean) {
      this.loading = value
    }
  }
})
