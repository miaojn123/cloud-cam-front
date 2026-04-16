<template>
  <div class="team-join-panel">
    <div class="panel-header">
      <h2 class="panel-title">加入团队</h2>
    </div>

    <div class="panel-content">
      <!-- 我加入的团队 -->
      <div class="join-section">
        <div class="section-header">
          <h3 class="section-title">我加入的团队</h3>
          <span class="section-count">{{ joinedTeams.length }} 个团队</span>
        </div>
        <div class="team-list">
          <div
            v-for="team in joinedTeams"
            :key="team.id"
            class="team-item"
            :class="{ 'is-current': team.id === currentTeamId }"
            @click="handleSwitchTeam(team)"
          >
            <div class="team-info">
              <span class="team-name">{{ team.name }}</span>
              <span class="team-id">ID: {{ team.id }}</span>
            </div>
            <div class="team-status">
              <el-icon
                v-if="team.id === currentTeamId"
                class="status-icon"
                :size="20"
              >
                <Check />
              </el-icon>
              <span v-else class="status-placeholder"></span>
              <el-button
                v-if="team.id === currentTeamId"
                type="danger"
                size="small"
                text
                class="exit-btn"
                :loading="exitingId === team.id"
                @click.stop="handleExitTeam(team)"
              >
                退出
              </el-button>
            </div>
          </div>
          <!-- 空状态 -->
          <el-empty v-if="joinedTeams.length === 0" description="暂无已加入的团队" :image-size="80" />
        </div>
      </div>

      <!-- 待加入的团队 -->
      <div class="join-section">
        <div class="section-header">
          <h3 class="section-title">待加入的团队</h3>
          <span class="section-count">{{ pendingTeams.length }} 个邀请</span>
        </div>
        <div class="team-list">
          <div
            v-for="team in pendingTeams"
            :key="team.id"
            class="team-item team-item--pending"
          >
            <div class="team-info">
              <span class="team-name">{{ team.name }}</span>
              <span class="team-id">ID: {{ team.id }}</span>
            </div>
            <div class="team-action">
              <el-button
                type="primary"
                size="default"
                :loading="joiningId === team.id"
                @click.stop="handleJoinTeam(team)"
              >
                加入团队
              </el-button>
            </div>
          </div>
          <!-- 空状态 -->
          <el-empty v-if="pendingTeams.length === 0" description="暂无待加入的团队" :image-size="80" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { getJoinTeamApi, getReceivedInviteApi, joinTeamApi, switchTeamApi, exitTeamApi } from '@/api/team'

export default {
  name: 'TeamJoinPanel',
  data() {
    return {
      joiningId: '',
      exitingId: '',
      loading: false,
    }
  },
  computed: {
    currentTeamId() {
      return this.$teamStore?.currentTeamId || null
    },
    joinedTeams() {
      return this.$teamStore?.myTeams || []
    },
    pendingTeams() {
      return this.$teamStore?.pendingTeams || []
    },
  },
  watch: {
    '$route.path': {
      handler() {
        // 每次路由变化时重新加载团队数据
        this.loadTeams()
      }
    }
  },
  mounted() {
    this.loadTeams()
  },
    async loadTeams() {
      this.loading = true
      try {
        // 获取已加入的团队
        const result = await getJoinTeamApi()
        this.$teamStore.setMyTeams(result.myTeams || [])
        
        // 获取待加入的团队（收到的邀请）
        const inviteResult = await getReceivedInviteApi()
        this.$teamStore.setPendingTeams(inviteResult || [])
      } catch {
        // 错误已在 request 拦截器中处理
      } finally {
        this.loading = false
      }
    },
    async handleSwitchTeam(team: { id: string; name: string }) {
      if (team.id === this.currentTeamId) return
      
      try {
        await switchTeamApi({ teamId: team.id })
        this.$teamStore.setCurrentTeam(team.id)
        ElMessage.success(`已切换到「${team.name}」`)
      } catch {
        // 错误已在 request 拦截器中处理
      }
    },
    async handleJoinTeam(team: { id: string; name: string }) {
      this.joiningId = team.id
      try {
        await joinTeamApi({ teamId: team.id })
        this.$teamStore.joinTeam(team.id)
        ElMessage.success(`成功加入「${team.name}」`)
      } catch {
        // 错误已在 request 拦截器中处理
      } finally {
        this.joiningId = ''
      }
    },
    async handleExitTeam(team: { id: string; name: string }) {
      try {
        await ElMessageBox.confirm(
          `确定要退出团队「${team.name}」吗？`,
          '确认退出',
          { type: 'warning' }
        )
        this.exitingId = team.id
        await exitTeamApi({ teamUuid: team.id })
        this.$teamStore.removeMyTeam(team.id)
        ElMessage.success(`已退出「${team.name}」`)
      } catch (error: any) {
        if (error !== 'cancel') {
          console.error('退出团队失败:', error)
        }
      } finally {
        this.exitingId = ''
      }
    },
  },
}
</script>

<style scoped>
.team-join-panel {
  background: #ffffff;
  border-radius: 8px;
  padding: 24px;
}

.panel-header {
  margin-bottom: 24px;
}

.panel-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.panel-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.join-section {
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.join-section:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.section-count {
  font-size: 13px;
  color: #9ca3af;
}

.team-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.team-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.team-item:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.team-item.is-current {
  background: #ecfdf5;
  border-color: #10b981;
}

.team-item--pending {
  background: #f9fafb;
  cursor: default;
}

.team-item--pending:hover {
  background: #f9fafb;
  border-color: #e5e7eb;
}

.team-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.team-name {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  min-width: 200px;
}

.team-id {
  font-size: 13px;
  color: #9ca3af;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  letter-spacing: 0.5px;
}

.team-status {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.status-icon {
  color: #10b981;
}

.status-placeholder {
  width: 18px;
  height: 18px;
  border: 2px solid #d1d5db;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.exit-btn {
  margin-left: 12px;
  font-size: 13px;
}

.team-item:hover .status-placeholder {
  border-color: #9ca3af;
}

.team-action {
  display: flex;
  align-items: center;
}

:deep(.el-empty) {
  padding: 32px 0;
}

:deep(.el-empty__description) {
  margin-top: 8px;
  font-size: 13px;
  color: #9ca3af;
}
</style>
