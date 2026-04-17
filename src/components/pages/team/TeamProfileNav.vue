<template>
  <nav class="team-top-nav" aria-label="团队页面顶栏">
    <div class="team-top-nav__left">
      <router-link to="/files" class="router-link-active el-tooltip__trigger">
        <img :src="logoSrc" alt="QJCAM" />
      </router-link>
    </div>

    <UserNavMenu :user="userSummary" :team-name="team?.teamName || ''" @command="$emit('command', $event)" />
  </nav>
</template>

<script lang="ts">
import type { PropType } from 'vue'
import UserNavMenu from '@/components/pages/user/UserNavMenu.vue'
import type { TeamSummary } from './TeamLayout.vue'
import type { UserSummary } from '@/types/user'

export default {
  name: 'TeamProfileNav',
  components: { UserNavMenu },
  props: {
    team: {
      type: Object as PropType<TeamSummary | null>,
      default: null,
    },
    logoSrc: { type: String, default: '/assets/images/logos/qjcam-logo-white.svg' },
  },
  emits: ['command'],
  computed: {
    userSummary(): UserSummary | null {
      const u = this.$userStore?.user
      if (!u) return null
      return {
        userName: u.userName || '',
        nickName: u.nickName || '',
        avatar: u.avatar || '',
      }
    },
  },
}
</script>

<style scoped>
.team-top-nav {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: var(--app-nav-bg);
  color: #ffffff;
}

.team-top-nav__left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.team-top-nav__left img {
  height: 56px;
  width: auto;
  cursor: pointer;
  margin-top: -4px;
  margin-left: -8px;
}

.team-top-nav__title {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}
</style>
