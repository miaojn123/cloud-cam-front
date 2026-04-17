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
          <el-empty v-if="joinedTeams.length === 0 && !loading" description="暂无已加入的团队" :image-size="80" />
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
          <el-empty v-if="pendingTeams.length === 0 && !loading" description="暂无待加入的团队" :image-size="80" />
        </div>
      </div>
    </div>

    <!-- 转让所有权对话框 -->
    <el-dialog
      v-model="showTransferDialog"
      title="转让团队所有权"
      width="420px"
      :close-on-click-modal="false"
    >
      <div class="transfer-content">
        <p class="transfer-tip">选择要接收团队所有权的成员：</p>
        <el-select
          v-model="selectedNewOwner"
          placeholder="请选择成员"
          class="owner-select"
        >
          <el-option
            v-for="member in localMembers"
            :key="member.id"
            :label="member.nickName || member.userName"
            :value="member.id"
          />
        </el-select>
      </div>
      <template #footer>
        <el-button @click="handleCancelTransfer">取消</el-button>
        <el-button type="primary" @click="handleTransferAndExit">
          确认转让并退出
        </el-button>
      </template>
    </el-dialog>
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
      showTransferDialog: false,
      currentExitTeam: null as { id: string; name: string } | null,
      localMembers: [] as any[],
      selectedNewOwner: '',
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
    currentUserId(): string {
      return this.$userStore?.user?.uuid || ''
    },
  },
  mounted() {
    this.loadTeams()
  },
  methods: {
    async loadTeams() {
      this.loading = true
      try {
        const result = await getJoinTeamApi()
        this.$teamStore.setMyTeams(result.data?.myTeams || [])
        
        const inviteResult = await getReceivedInviteApi()
        this.$teamStore.setPendingTeams(inviteResult.data?.invites || [])
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
    isTeamOwner(teamId: string): boolean {
      const allMembers = this.$teamStore?.teamMembers[teamId] || []
      const currentUserId = this.currentUserId
      const member = allMembers.find(m => m.userId === currentUserId || m.id === currentUserId)
      return member?.role === 'owner'
    },
    async handleExitTeam(team: { id: string; name: string }) {
      if (this.isTeamOwner(team.id)) {
        ElMessageBox.confirm(
          `您是团队「${team.name}」的所有者，退出团队将解散该团队。\n\n是否先转让团队所有权给其他成员？`,
          '退出即解散',
          {
            type: 'warning',
            confirmButtonText: '转让后退出',
            cancelButtonText: '直接解散',
            distinguishCancelAndClose: true,
          }
        ).then(() => {
          this.currentExitTeam = team
          this.selectedNewOwner = ''
          this.localMembers = this.$teamStore?.getTransferableMembers(team.id) || []
          if (this.localMembers.length === 0) {
            ElMessage.warning('没有可转让的成员，将直接解散团队')
            this.doExitTeam(team)
          } else {
            this.showTransferDialog = true
          }
        }).catch((action: string) => {
          if (action === 'cancel') {
            this.doExitTeam(team)
          }
        })
      } else {
        ElMessageBox.confirm(
          `确定要退出团队「${team.name}」吗？`,
          '确认退出',
          { type: 'warning' }
        ).then(() => {
          this.doExitTeam(team)
        }).catch(() => {})
      }
    },
    async doExitTeam(team: { id: string; name: string }) {
      this.exitingId = team.id
      try {
        await exitTeamApi({ teamUuid: team.id })
        this.$teamStore.removeMyTeam(team.id)
        ElMessage.success(`已退出「${team.name}」`)
      } catch {
        // 错误已在 request 拦截器中处理
      } finally {
        this.exitingId = ''
      }
    },
    async handleTransferAndExit() {
      if (!this.selectedNewOwner) {
        ElMessage.warning('请选择要接收团队的新所有者')
        return
      }
      this.showTransferDialog = false
      try {
        await exitTeamApi({ teamUuid: this.currentExitTeam?.id || '', newOwnerId: this.selectedNewOwner })
        this.$teamStore.updateMemberRole(this.currentExitTeam?.id || '', this.selectedNewOwner, 'owner')
        ElMessage.success('团队所有权已转让')
        if (this.currentExitTeam) {
          this.$teamStore.removeMyTeam(this.currentExitTeam.id)
        }
        ElMessage.success('已退出团队')
      } catch {
        // 错误已在 request 拦截器中处理
      }
      this.currentExitTeam = null
    },
    handleCancelTransfer() {
      this.showTransferDialog = false
      this.currentExitTeam = null
      ElMessage.info('已取消操作')
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
  gap: 8px;
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

.transfer-content {
  padding: 8px 0;
}

.transfer-tip {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #374151;
}

.owner-select {
  width: 100%;
}
</style>
