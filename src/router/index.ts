import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '@/components/pages/auth/LoginPage.vue'
import RegisterPage from '@/components/pages/auth/RegisterPage.vue'
import ResetPassword from '@/components/pages/auth/ResetPassword.vue'
import FilePage from '@/components/pages/files/FilePage.vue'
import UserProfileLayout from '@/components/pages/user/UserProfileLayout.vue'
import TeamLayout from '@/components/pages/team/TeamLayout.vue'
import TeamJoinPanel from '@/components/pages/team/TeamJoinPanel.vue'
import TeamCreatePanel from '@/components/pages/team/TeamCreatePanel.vue'
import TeamMembersPanel from '@/components/pages/team/TeamMembersPanel.vue'
import TeamProjectsPanel from '@/components/pages/team/TeamProjectsPanel.vue'
import TeamSettingsPanel from '@/components/pages/team/TeamSettingsPanel.vue'
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
    { path: '/files', redirect: '/personal-files' },
    { path: '/recent-files', name: 'recent-files', component: FilePage, meta: { requiresAuth: true } },
    { path: '/personal-files', name: 'personal-files', component: FilePage, meta: { requiresAuth: true } },
    { path: '/workspace/:uuid', name: 'workspace', component: FilePage, meta: { requiresAuth: true } },
    { path: '/team-files', name: 'team-files', component: FilePage, meta: { requiresAuth: true } },
    { path: '/shared-files', name: 'shared-files', component: FilePage, meta: { requiresAuth: true } },
    { path: '/received-files', name: 'received-files', component: FilePage, meta: { requiresAuth: true } },
    { path: '/recycle-bin', name: 'recycle-bin', component: FilePage, meta: { requiresAuth: true } },
    {
      path: '/team',
      component: TeamLayout,
      meta: { requiresAuth: true },
      redirect: { name: 'team-join' },
      children: [
        { path: 'join', name: 'team-join', component: TeamJoinPanel },
        { path: 'create', name: 'team-create', component: TeamCreatePanel },
        { path: 'members', name: 'team-members', component: TeamMembersPanel },
        { path: 'projects', name: 'team-projects', component: TeamProjectsPanel },
        { path: 'settings', name: 'team-settings', component: TeamSettingsPanel },
      ],
    },
    {
      path: '/profile-personal',
      name: 'user-profile-personal',
      component: UserProfileLayout,
      meta: { requiresAuth: true },
    },
    {
      path: '/profile-security',
      name: 'user-profile-security',
      component: UserProfileLayout,
      meta: { requiresAuth: true },
    },
  ]
})

router.beforeEach(async (to) => {
  // Browser and embedded CEF do not share storage by default.
  // Desktop can pass token in the first URL; persist it, then strip it from query.
  const urlToken = pickExternalAuthTokenFromQuery(to.query)
  if (urlToken) {
    const userStore = useUserStore()
    // Save token first and clean the address bar immediately to avoid leaking token
    // into browser history, logs, or sharing links.
    // In external browser scenarios backend might be temporarily unavailable,
    // so do not force redirect to login at this point.
    userStore.setToken(urlToken)
    try {
      await userStore.fetchCurrentUser({ skipAuthRedirect: true })
    } catch {
      // Keep token for follow-up retries. If token is invalid, API layer will
      // surface the error and user can sign in again.
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
    // Desktop flow must keep client=desktop or Qt bridge may reject callback.
    const q = preserveDesktopClientQuery(to.query)
    return Object.keys(q).length ? { path: '/login', query: q } : '/login'
  }
  // In desktop embed, login continuation is handled by Qt, so do not auto jump.
  if (to.path === '/login' && token && !isDesktopEmbed(to.query)) {
    return '/files'
  }
  return true
})


