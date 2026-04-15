<template>
  <header class="team-profile-nav">
    <div class="team-profile-nav__inner">
      <!-- 左侧：团队信息 -->
      <div class="team-profile-nav__team-info">
        <div class="team-profile-nav__avatar">
          <img v-if="team?.teamAvatar" :src="team.teamAvatar" alt="团队头像" />
          <div v-else class="team-profile-nav__avatar-placeholder">
            <el-icon :size="24"><OfficeBuilding /></el-icon>
          </div>
        </div>
        <div class="team-profile-nav__meta">
          <span class="team-profile-nav__name">{{ team?.teamName || '团队管理' }}</span>
          <span class="team-profile-nav__stats">
            {{ team?.memberCount || 0 }} 成员 · {{ team?.projectCount || 0 }} 项目
          </span>
        </div>
      </div>

      <!-- 右侧：用户菜单 -->
      <UserNavMenu :user="userSummary" :team-name="team?.teamName || ''" @command="$emit('command', $event)" />
    </div>
  </header>
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
.team-profile-nav {
  flex: 0 0 auto;
  height: 64px;
  background: var(--app-brand-primary);
  display: flex;
  align-items: center;
  padding: 0 24px;
}

.team-profile-nav__inner {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.team-profile-nav__team-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.team-profile-nav__avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.team-profile-nav__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.team-profile-nav__avatar-placeholder {
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.team-profile-nav__meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.team-profile-nav__name {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

.team-profile-nav__stats {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.75);
}
</style>
