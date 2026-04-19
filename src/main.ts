import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@/style.css'
import App from '@/App.vue'
import { router } from '@/router'
import { pinia, useUserStore } from '@/stores'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)

app.use(ElementPlus)
// 全局注册 element-plus 图标组件。
Object.entries(ElementPlusIconsVue).forEach(([key, component]) => {
  app.component(key, component)
})
app.use(pinia)
// 主动创建 user store，触发 plugin 将 $userStore 挂到 globalProperties
useUserStore()
app.use(router)
app.mount('#app')
