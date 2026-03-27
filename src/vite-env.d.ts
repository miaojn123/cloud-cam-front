/// <reference types="vite/client" />

import type { DesktopHostBridge } from '@/utils/desktopBridge'

declare global {
  interface Window {
    __CAMDEMO_QT__?: DesktopHostBridge
  }
}

export {}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}
