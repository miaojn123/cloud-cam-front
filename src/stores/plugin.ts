import type { PiniaPlugin } from 'pinia'
import type { useUserStore } from '@/stores/modules/user'
import type { useTeamStore } from '@/stores/modules/team'

/**
 * 将 store 实例挂到 Vue 全局，组件内通过 this.$xxxStore 访问。
 */
export const userStoreGlobalPlugin: PiniaPlugin = ({ app, store }) => {
    app.config.globalProperties.$userStore = store as ReturnType<typeof useUserStore>
    app.config.globalProperties.$teamStore = store as ReturnType<typeof useTeamStore>
}
