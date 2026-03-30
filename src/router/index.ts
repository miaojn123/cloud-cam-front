import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '@/components/LoginPage.vue'
import RegisterPage from '@/components/RegisterPage.vue'
import ResetPassword from '@/components/ResetPassword.vue'
import FilePage from '@/components/FilePage.vue'
import { TOKEN_KEY } from '@/api'
import { isDesktopEmbed, preserveDesktopClientQuery } from '@/utils/desktopBridge'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: (to) => ({ path: '/login', query: to.query }) },
    { path: '/login', name: 'login', component: LoginPage },
    { path: '/register', name: 'register', component: RegisterPage },
    { path: '/reset-password', name: 'reset-password', component: ResetPassword },
    { path: '/files', name: 'files', component: FilePage, meta: { requiresAuth: true } }
  ]
})

router.beforeEach((to) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (to.meta.requiresAuth && !token) {
    // 桌面端需要保留 ?client=desktop，否则 Qt 侧会拒绝桥接（例如登录成功回调）。
    const q = preserveDesktopClientQuery(to.query)
    return Object.keys(q).length ? { path: '/login', query: q } : '/login'
  }
  // 桌面嵌入登录页由 Qt 接管后续流程，避免这里自动跳到 /files。
  if (to.path === '/login' && token && !isDesktopEmbed(to.query)) {
    return '/files'
  }
  return true
})

