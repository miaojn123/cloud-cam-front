/// <reference types="vite/client" />

import type { DesktopHostBridge } from '@/utils/desktopBridge'
import type { useUserStore } from '@/stores/modules/user'

declare module 'vue' {
  interface ComponentCustomProperties {
    /** 由 src/plugin.ts（Pinia 插件）注入，与 useUserStore() 同一实例 */
    $userStore: ReturnType<typeof useUserStore>
  }
}

declare global {
  interface Window {
    __DESKTOP_QT__?: DesktopHostBridge
  }
}

export {}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}
