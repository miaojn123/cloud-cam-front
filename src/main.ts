import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@/style.css'
import App from '@/App.vue'
import { router } from '@/router'
import { pinia, useUserStore } from '@/stores'

const app = createApp(App)

app.use(ElementPlus)
app.use(pinia)
// 主动创建 user store，触发 plugin 将 $userStore 挂到 globalProperties
useUserStore()
app.use(router)
app.mount('#app')
