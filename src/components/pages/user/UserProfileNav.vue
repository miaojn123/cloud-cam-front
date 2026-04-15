<template>
  <nav class="personal-profile-nav" id="personal-profile-nav">
    <div class="personal-profile-nav__left">
      <router-link to="/files" class="router-link-active el-tooltip__trigger">
        <img :src="logoSrc" alt="QJCAM" />
      </router-link>
    </div>
    <UserNavMenu :user="user" @command="$emit('command', $event)" />
  </nav>
</template>

<script lang="ts">
import type { PropType } from 'vue'
import UserNavMenu from './UserNavMenu.vue'
import type { UserSummary } from '@/types/user'

export default {
  name: 'UserProfileNav',
  components: { UserNavMenu },
  props: {
    user: {
      type: Object as PropType<UserSummary | null>,
      default: null,
    },
    logoSrc: { type: String, default: '/assets/images/logos/qjcam-logo-white.svg' },
  },
  emits: ['command'],
}
</script>

<style scoped>
.personal-profile-nav {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: var(--app-nav-bg);
  color: #ffffff;
}

.personal-profile-nav__left img {
  height: 56px;
  width: auto;
  cursor: pointer;
  margin-top: -4px;
  margin-left: -16px;
}
</style>
