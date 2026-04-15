import { createPinia } from 'pinia'
import { userStoreGlobalPlugin } from './plugin'

export const pinia = createPinia()
pinia.use(userStoreGlobalPlugin)

export { useUserStore } from './modules/user'
