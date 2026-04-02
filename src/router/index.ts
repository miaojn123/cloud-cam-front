import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '@/components/auth/LoginPage.vue'
import RegisterPage from '@/components/auth/RegisterPage.vue'
import ResetPassword from '@/components/auth/ResetPassword.vue'
import FilePage from '@/components/FilePage.vue'
import PersonalProfileLayout from '@/components/personal/PersonalProfileLayout.vue'
import ProfilePersonalPanel from '@/components/personal/ProfilePersonalPanel.vue'
import ProfileSecurityPanel from '@/components/personal/ProfileSecurityPanel.vue'
import { TOKEN_KEY } from '@/api'
import { useUserStore } from '@/stores'
import {
  isDesktopEmbed,
  omitExternalAuthTokenFromQuery,
  pickExternalAuthTokenFromQuery,
  preserveDesktopClientQuery
} from '@/utils/desktopBridge'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: (to) => ({ path: '/login', query: to.query }) },
    { path: '/login', name: 'login', component: LoginPage },
    { path: '/register', name: 'register', component: RegisterPage },
    { path: '/reset-password', name: 'reset-password', component: ResetPassword },
    { path: '/files', name: 'files', component: FilePage, meta: { requiresAuth: true } },
    {
      path: '/personalProfile',
      component: PersonalProfileLayout,
      meta: { requiresAuth: true },
      redirect: { name: 'personal-profile-personal' },
      children: [
        {
          path: 'personal',
          name: 'personal-profile-personal',
          component: ProfilePersonalPanel,
        },
        {
          path: 'security',
          name: 'personal-profile-security',
          component: ProfileSecurityPanel,
        },
        {
          path: 'settings',
          redirect: { name: 'personal-profile-personal' },
        },
      ],
    },
  ]
})

router.beforeEach(async (to) => {
  // 默认浏览器打开时与嵌入式 CEF 不共享 storage，桌面端可在首跳 URL 带 token，此处写入后立即 strip
  const urlToken = pickExternalAuthTokenFromQuery(to.query)
  if (urlToken) {
    const userStore = useUserStore()
    // 先写入 token 并立即清理地址栏，避免 token 进入历史记录/误分享
    // 注意：外置浏览器场景下，后端接口可能暂不可用（未启动/代理失败），此处不应强制回登录页
    userStore.setToken(urlToken)
    try {
      await userStore.fetchCurrentUser({ skipAuthRedirect: true })
    } catch {
      // 保持 token 以便后续页面自行重试；若 token 无效，接口层会提示并可由用户重新登录
    }
    return {
      path: to.path,
      query: omitExternalAuthTokenFromQuery(to.query),
      hash: to.hash,
      replace: true
    }
  }

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

