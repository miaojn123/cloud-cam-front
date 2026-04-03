<script lang="ts">
import type { PropType } from 'vue'
import UserNavMenu from '@/components/nav/UserNavMenu.vue'
import type { UserSummary } from '@/types/user'

export default {
  name: 'FilesNav',
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

<template>
  <nav class="files-nav" id="files-page-nav">
    <div class="files-nav__left">
      <a href="/files" class="router-link-active el-tooltip__trigger">
        <img :src="logoSrc" alt="QJCAM" />
      </a>
    </div>
    <UserNavMenu :user="user" @command="$emit('command', $event)" />
  </nav>
</template>

<style scoped>
.files-nav {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: var(--app-nav-bg);
  color: #ffffff;
}

.files-nav__left img {
  height: 56px;
  width: auto;
  cursor: pointer;
  margin-top: -4px;
  margin-left: -16px;
}
</style>
