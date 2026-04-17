<template>
  <div class="team-page" v-loading="loading">
    <TeamProfileNav :team="teamSummary" @command="handleNavCommand" />

    <div class="team-page__shell">
      <nav class="team-page__aside" aria-label="团队管理子导航">
        <ul class="team-page__menu" role="list">
          <li role="none">
            <router-link
              to="/team/join"
              class="team-page__menu-item"
              active-class="is-active"
            >
              <el-icon class="team-page__menu-icon" :size="18">
                <Plus />
              </el-icon>
              <span>加入团队</span>
            </router-link>
          </li>
          <li role="none">
            <router-link
              to="/team/create"
              class="team-page__menu-item"
              active-class="is-active"
            >
              <el-icon class="team-page__menu-icon" :size="18">
                <FolderAdd />
              </el-icon>
              <span>创建团队</span>
            </router-link>
          </li>
          <li role="none">
            <router-link
              to="/team/members"
              class="team-page__menu-item"
              active-class="is-active"
            >
              <el-icon class="team-page__menu-icon" :size="18">
                <User />
              </el-icon>
              <span>团队成员</span>
            </router-link>
          </li>
          <li role="none">
            <router-link
              to="/team/projects"
              class="team-page__menu-item"
              active-class="is-active"
            >
              <el-icon class="team-page__menu-icon" :size="18">
                <Folder />
              </el-icon>
              <span>团队项目</span>
            </router-link>
          </li>
          <li role="none">
            <router-link
              to="/team/settings"
              class="team-page__menu-item"
              active-class="is-active"
            >
              <el-icon class="team-page__menu-icon" :size="18">
                <Setting />
              </el-icon>
              <span>团队设置</span>
            </router-link>
          </li>
        </ul>
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
import TeamProfileNav from '@/components/pages/team/TeamProfileNav.vue'
import TeamJoinPanel from '@/components/pages/team/TeamJoinPanel.vue'
import TeamCreatePanel from '@/components/pages/team/TeamCreatePanel.vue'
import TeamMembersPanel from '@/components/pages/team/TeamMembersPanel.vue'
import TeamProjectsPanel from '@/components/pages/team/TeamProjectsPanel.vue'
import TeamSettingsPanel from '@/components/pages/team/TeamSettingsPanel.vue'
import { getTeamMembersApi } from '@/api/team'

export interface TeamSummary {
  teamId: string
  teamName: string
  teamAvatar?: string
  memberCount: number
  projectCount: number
  role: 'owner' | 'admin' | 'member'
}

export default {
  name: 'TeamLayout',
  components: {
    TeamProfileNav,
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
    teamSummary(): TeamSummary | null {
      return this.currentTeam
    },
    currentRoutePath(): string {
      return this.$route.path
    },
    isJoinPanel(): boolean {
      return this.currentRoutePath === '/team/join'
    },
    isCreatePanel(): boolean {
      return this.currentRoutePath === '/team/create'
    },
    isMembersPanel(): boolean {
      return this.currentRoutePath === '/team/members'
    },
    isProjectsPanel(): boolean {
      return this.currentRoutePath === '/team/projects'
    },
    isSettingsPanel(): boolean {
      return this.currentRoutePath === '/team/settings'
    },
    currentTeamId(): string | null {
      return this.$teamStore?.currentTeamId || null
    },
    hasJoinedTeam(): boolean {
      return this.currentTeamId !== null
    },
  },
  mounted() {
    this.loadCurrentTeam()
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
  methods: {
    async loadCurrentTeam() {
      if (!this.currentTeamId) {
        this.currentTeam = null
        return
      }
      this.loading = true
      try {
        const result = await getTeamMembersApi({ teamUuid: this.currentTeamId })
        const members = result.data?.members || []
        const memberCount = members.length
        const currentUserId = this.$userStore?.user?.uuid || ''
        const currentMember = members.find((m: any) => m.userId === currentUserId)
        const currentTeamData = this.$teamStore?.myTeams?.find(t => t.id === this.currentTeamId)
        
        this.currentTeam = {
          teamId: this.currentTeamId,
          teamName: currentTeamData?.name || '未知团队',
          memberCount: memberCount,
          projectCount: 0,
          role: currentMember?.role || currentTeamData?.role || 'member',
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
}

.team-page__menu {
  list-style: none;
  margin: 0;
  padding: 12px 0;
}

.team-page__menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
  text-align: left;
  transition: background 0.15s ease, color 0.15s ease;
  text-decoration: none;
  box-sizing: border-box;
}

.team-page__menu-item:hover {
  background: #f3f4f6;
}

.team-page__menu-item.is-active {
  color: var(--app-brand-primary);
  font-weight: 600;
  background: rgba(13, 71, 107, 0.06);
  box-shadow: inset 4px 0 0 var(--app-brand-primary);
}

.team-page__menu-icon {
  flex-shrink: 0;
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
