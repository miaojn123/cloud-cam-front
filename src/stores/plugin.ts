import type { PiniaPlugin } from 'pinia'
import type { useUserStore } from '@/stores/modules/user'

/**
 * 将 user store 实例挂到 Vue 全局，组件内通过 this.$userStore 访问。
 * 仅在 id 为 user 的 store 初始化时执行，避免重复赋值。
 */
export const userStoreGlobalPlugin: PiniaPlugin = ({ app, store }) => {
    if (store.$id !== 'user') return
    app.config.globalProperties.$userStore = store as ReturnType<typeof useUserStore>
}
