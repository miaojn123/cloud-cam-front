import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@/style.css'
import App from '@/App.vue'
import { router } from '@/router'
import { pinia, useUserStore } from '@/stores'
import { TOKEN_KEY } from '@/api'
import { isDesktopEmbed, notifyDesktopLoginSuccess, cloneUserForDesktopBridge } from '@/utils/desktopBridge'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)

app.use(ElementPlus)
// 中文：全局注册 element-plus 图标组件。
// 为避免与 HTML 原生标签重名（例如 menu/search/link），这里额外注册一份带前缀的组件名（例如 <EpMenu />）。
Object.entries(ElementPlusIconsVue).forEach(([key, component]) => {
  app.component(key, component)
  app.component(`Ep${key}`, component)
})
app.use(pinia)
// 主动创建 user store，触发 plugin 将 $userStore 挂到 globalProperties
const userStore = useUserStore()
const token = localStorage.getItem(TOKEN_KEY)
if (token) {
  // 启动时主动校验一次登录态，避免 token 过期后落入“有 token 但无有效会话”的半登录态。
  userStore.fetchCurrentUser().then(() => {
    // 拉到用户信息后，如果是桌面嵌入模式，立即回传给 Qt
    // 这样 Qt 端启动恢复时能获得完整用户信息（昵称、头像等）
    if (isDesktopEmbed() && userStore.user) {
      notifyDesktopLoginSuccess({
        token: userStore.token,
        user: cloneUserForDesktopBridge(userStore.user)
      })
    }
  }).catch(() => {
    // 桌面嵌入模式下允许离线重试，不在启动阶段直接清 token。
    if (!isDesktopEmbed()) {
      userStore.clearAuth()
    }
  })
}
app.use(router)
app.mount('#app')
