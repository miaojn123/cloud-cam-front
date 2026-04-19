<template>
  <div class="team-page" v-loading="loading">
    <UserNav :user="getUserSummary()" @command="handleNavCommand" />

    <div class="team-page__shell">
      <nav class="team-page__aside" aria-label="团队管理子导航">
        <el-menu class="team-page__menu" :default-active="activeMenuKey" @select="handleMenuSelect">
          <el-menu-item index="join">
            <el-icon class="team-page__menu-icon"><Plus /></el-icon>
            <span class="team-page__menu-label">加入团队</span>
          </el-menu-item>
          <el-menu-item index="create">
            <el-icon class="team-page__menu-icon"><FolderAdd /></el-icon>
            <span class="team-page__menu-label">创建团队</span>
          </el-menu-item>
          <el-menu-item index="members">
            <el-icon class="team-page__menu-icon"><User /></el-icon>
            <span class="team-page__menu-label">团队成员</span>
          </el-menu-item>
          <el-menu-item index="projects">
            <el-icon class="team-page__menu-icon"><Folder /></el-icon>
            <span class="team-page__menu-label">团队项目</span>
          </el-menu-item>
          <el-menu-item index="settings">
            <el-icon class="team-page__menu-icon"><Setting /></el-icon>
            <span class="team-page__menu-label">团队设置</span>
          </el-menu-item>
        </el-menu>
      </nav>

      <main class="team-page__main" aria-label="团队管理详情内容">
        <TeamJoinPanel v-if="isJoinPanel" />
        <TeamCreatePanel v-else-if="isCreatePanel" />
        <div v-else-if="!hasJoinedTeam" class="team-page__empty">
          <el-empty description="暂未加入任何团队，请加入团队后再试" />
        </div>
        <TeamMembersPanel v-else-if="isMembersPanel" />
        <TeamProjectsPanel v-else-if="isProjectsPanel" />
        <TeamSettingsPanel v-else-if="isSettingsPanel" />
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import type { TeamMember } from '@/api/team'
import UserNav from '@/components/pages/user/UserNav.vue'
import TeamJoinPanel from '@/components/pages/team/TeamJoinPanel.vue'
import TeamCreatePanel from '@/components/pages/team/TeamCreatePanel.vue'
import TeamMembersPanel from '@/components/pages/team/TeamMembersPanel.vue'
import TeamProjectsPanel from '@/components/pages/team/TeamProjectsPanel.vue'
import TeamSettingsPanel from '@/components/pages/team/TeamSettingsPanel.vue'
import { getTeamMembersApi } from '@/api/team'
import type { UserSummary } from '@/types/user'

export interface TeamSummary {
  teamId: string
  teamName: string
  teamAvatar?: string
  memberCount: number
  projectCount: number
  role: 'owner' | 'admin' | 'member'
}

export default {
  name: 'TeamPage',
  components: {
    UserNav,
    TeamJoinPanel,
    TeamCreatePanel,
    TeamMembersPanel,
    TeamProjectsPanel,
    TeamSettingsPanel,
  },
  data() {
    return {
      loading: false,
      currentTeam: null as TeamSummary | null,
    }
  },
  computed: {
    currentRouteName(): string {
      return this.$route.name as string
    },
    isJoinPanel(): boolean {
      return this.currentRouteName === 'team-join'
    },
    isCreatePanel(): boolean {
      return this.currentRouteName === 'team-create'
    },
    isMembersPanel(): boolean {
      return this.currentRouteName === 'team-members'
    },
    isProjectsPanel(): boolean {
      return this.currentRouteName === 'team-projects'
    },
    isSettingsPanel(): boolean {
      return this.currentRouteName === 'team-settings'
    },
    activeMenuKey(): string {
      if (this.isCreatePanel) return 'create'
      if (this.isMembersPanel) return 'members'
      if (this.isProjectsPanel) return 'projects'
      if (this.isSettingsPanel) return 'settings'
      return 'join'
    },
    currentTeamId(): string | null {
      return this.$teamStore?.currentTeamId || null
    },
    hasJoinedTeam(): boolean {
      return this.currentTeamId !== null
    },
  },
  watch: {
    currentTeamId: {
      handler(newTeamId) {
        if (newTeamId) {
          this.loadCurrentTeam()
        }
      },
      immediate: true,
    },
  },
  mounted() {
    this.loadCurrentTeam()
  },
  methods: {
    getUserSummary(): UserSummary | null {
      const u = this.$userStore.user
      if (!u) return null
      const avatar = u.avatar && String(u.avatar).trim() ? String(u.avatar).trim() : ''
      return {
        userName: u.userName || '',
        nickName: u.nickName || '',
        avatar,
      }
    },
    handleMenuSelect(key: string) {
      const routeMap: Record<string, string> = {
        join: '/team/join',
        create: '/team/create',
        members: '/team/members',
        projects: '/team/projects',
        settings: '/team/settings',
      }
      const target = routeMap[key]
      if (target) return this.$router.push(target)
    },
    async loadCurrentTeam() {
      if (!this.currentTeamId) {
        this.currentTeam = null
        return
      }
      this.loading = true
      try {
        const members = (await getTeamMembersApi({ teamUuid: this.currentTeamId })).data?.members || []
        const memberCount = members.length
        const currentUserId = localStorage.getItem('userId')
        const currentMember = members.find((member: TeamMember) => member.userId === currentUserId)
        const currentTeam = this.$teamStore?.myTeams?.find(t => t.id === this.currentTeamId)

        this.currentTeam = {
          teamId: this.currentTeamId,
          teamName: currentTeam?.name || '未知团队',
          memberCount,
          projectCount: 0,
          role: currentMember?.role || currentTeam?.role || 'member',
        }
      } catch {
        this.currentTeam = null
      } finally {
        this.loading = false
      }
    },
    handleNavCommand(cmd: string) {
      if (cmd === 'userInfo') {
        return this.$router.push('/profile-personal')
      }
      if (cmd === 'logout') {
        return this.handleLogout()
      }
      ElMessage.info('功能开发中')
    },
    async handleLogout() {
      this.loading = true
      try {
        await this.$userStore.logout()
        ElMessage.success('退出成功')
      } catch {
        ElMessage.error('退出失败')
      } finally {
        this.loading = false
        this.$router.push('/login')
      }
    },
  },
}
</script>

<style scoped>
.team-page {
  height: 100%;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #ffffff;
}

.team-page__shell {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: row;
  overflow: hidden;
}

.team-page__aside {
  flex: 0 0 240px;
  width: 240px;
  background: #ffffff;
  border-right: 1px solid #eef0f3;
  overflow: auto;
  padding: 8px;
}

.team-page__menu {
  border-right: none;
}

.team-page__aside :deep(.el-menu-item) {
  height: 44px;
  line-height: 44px;
  border-radius: 6px;
  margin: 2px 6px;
  color: #4b5563;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.team-page__aside :deep(.el-menu-item:hover) {
  background: #f5f8ff;
  color: #1d4ed8;
}

.team-page__aside :deep(.el-menu-item.is-active) {
  background: #e8f0ff;
  color: #1d4ed8;
}

.team-page__aside :deep(.el-menu-item.is-active .team-page__menu-label) {
  font-weight: 700;
}

.team-page__menu-icon {
  margin-right: 10px;
  color: inherit;
}

.team-page__menu-label {
  font-size: 16px;
  color: inherit;
}

.team-page__main {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #f5f6f8;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 20px 24px;
}

.team-page__main > :deep(*) {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.team-page__empty {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border-radius: 8px;
}
</style>
