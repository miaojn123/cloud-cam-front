import type { PiniaPlugin } from 'pinia'

/**
 * 将 store 实例挂到 Vue 全局，组件内通过 this.$xxxStore 访问。
 */
export const userStoreGlobalPlugin: PiniaPlugin = ({ app, store }) => {
  const globalKey = `$${store.$id}Store`
  ;(app.config.globalProperties as Record<string, unknown>)[globalKey] = store
}
