/// <reference types="vite/client" />

import type { DesktopHostBridge } from '@/utils/desktopBridge'
import type { useUserStore } from '@/stores/modules/user'
import type { useTeamStore } from '@/stores/modules/team'
import type { RouteLocationNormalizedLoaded, Router } from 'vue-router'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    /** 由 src/stores/plugin.ts（Pinia 插件）注入，与 useUserStore() 同一实例 */
    $userStore: ReturnType<typeof useUserStore>
    /** 由 src/stores/plugin.ts（Pinia 插件）注入，与 useTeamStore() 同一实例 */
    $teamStore: ReturnType<typeof useTeamStore>
    /** 由 vue-router 注入 */
    $route: RouteLocationNormalizedLoaded
    /** 由 vue-router 注入 */
    $router: Router
  }
}

declare global {
  interface Window {
    __DESKTOP_QT__?: DesktopHostBridge
  }
}

export { }

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}
