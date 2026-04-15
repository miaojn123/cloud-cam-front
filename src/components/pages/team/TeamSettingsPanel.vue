<template>
  <div class="team-settings-panel">
    <div class="panel-header">
      <h2 class="panel-title">团队设置</h2>
    </div>

    <div class="panel-content">
      <!-- 团队名称 -->
      <div class="settings-section">
        <div class="section-header">
          <h3 class="section-title">团队名称</h3>
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-name">{{ teamInfo.name }}</span>
            <span class="setting-id">ID: {{ teamInfo.id }}</span>
          </div>
          <el-button v-if="isOwner" link type="primary" @click="showEditNameDialog = true">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
        </div>
      </div>

      <!-- 文件共享 -->
      <div class="settings-section">
        <div class="section-header">
          <h3 class="section-title">文件共享</h3>
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">允许共享</span>
            <span class="setting-desc">开启后，团队成员可以共享文件</span>
          </div>
          <el-switch v-if="isOwner" v-model="settings.allowShare" @change="handleSettingChange" />
          <el-switch v-else v-model="settings.allowShare" disabled />
        </div>
      </div>

      <!-- 访问 -->
      <div class="settings-section">
        <div class="section-header">
          <h3 class="section-title">访问</h3>
        </div>
        <div class="setting-item">
          <span class="setting-label">如何邀请新成员加入团队</span>
          <el-select v-if="isOwner" v-model="settings.inviteMethod" class="invite-select" @change="handleSettingChange">
            <el-option label="仅团队所有者可邀请" value="owner" />
            <el-option label="需要团队所有者批准" value="approval" />
            <el-option label="不需要批准" value="all" />
          </el-select>
          <el-select v-else v-model="settings.inviteMethod" class="invite-select" disabled>
            <el-option label="仅团队所有者可邀请" value="owner" />
            <el-option label="需要团队所有者批准" value="approval" />
            <el-option label="不需要批准" value="all" />
          </el-select>
        </div>
      </div>

      <!-- 其他 -->
      <div class="settings-section" v-if="isOwner">
        <div class="section-header">
          <h3 class="section-title">其他</h3>
        </div>
        <div class="setting-item setting-item--danger">
          <div class="setting-info">
            <span class="setting-label">转让团队</span>
            <span class="setting-desc">将团队所有权转让给其他成员</span>
          </div>
          <el-button type="danger" plain @click="openTransferDialog">
            转让团队
          </el-button>
        </div>
        <div class="setting-item setting-item--danger" style="margin-top: 12px;">
          <div class="setting-info">
            <span class="setting-label">解散团队</span>
            <span class="setting-desc">删除团队及所有相关数据，此操作不可恢复</span>
          </div>
          <el-button type="danger" @click="handleDeleteTeam" :loading="deleting">
            解散团队
          </el-button>
        </div>
      </div>
    </div>

    <!-- 编辑团队名称对话框 -->
    <el-dialog v-model="showEditNameDialog" title="编辑团队名称" width="480px">
      <el-form
        ref="formRef"
        :model="editForm"
        :rules="formRules"
        label-position="top"
      >
        <el-form-item label="团队名称" prop="name">
          <el-input
            v-model="editForm.name"
            placeholder="请输入团队名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditNameDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSaveName" :loading="saving">
          保存
        </el-button>
      </template>
    </el-dialog>

    <!-- 转让团队对话框 -->
    <el-dialog v-model="showTransferDialog" title="转让团队" width="480px">
      <div class="transfer-dialog-content">
        <p class="transfer-tip">选择要接收团队所有权的成员。转让后，您将不再是团队所有者。</p>
        <el-form :model="transferForm" label-position="top">
          <el-form-item label="选择新所有者">
            <el-select
              v-model="transferForm.newOwnerId"
              placeholder="请选择成员"
              class="transfer-select"
              filterable
            >
              <el-option
                v-for="member in members"
                :key="member.userId"
                :label="member.nickName || member.userName"
                :value="member.userId"
              >
                <div class="member-option">
                  <el-avatar :size="24" :src="member.avatar">
                    {{ member.nickName?.charAt(0) || '?' }}
                  </el-avatar>
                  <span>{{ member.nickName || member.userName }}</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="showTransferDialog = false">取消</el-button>
        <el-button type="danger" @click="handleTransferTeam" :loading="transferring">
          确认转让
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { getTeamSettingsApi, updateTeamSettingsApi, updateTeamApi, deleteTeamApi, getTeamMembersApi, transferTeamApi } from '@/api/team'

interface TeamInfo {
  id: string
  name: string
}

interface TeamSettings {
  allowShare: boolean
  inviteMethod: 'owner' | 'approval' | 'all'
}

export default {
  name: 'TeamSettingsPanel',
  data() {
    return {
      formRef: null as FormInstance | null,
      showEditNameDialog: false,
      saving: false,
      teamInfo: {
        id: '',
        name: '',
      } as TeamInfo,
      settings: {
        allowShare: false,
        inviteMethod: 'owner' as 'owner' | 'approval' | 'all',
      } as TeamSettings,
      editForm: {
        name: '',
      },
      formRules: {
        name: [
          { required: true, message: '请输入团队名称', trigger: 'blur' },
          { min: 2, max: 50, message: '团队名称长度在 2 到 50 个字符', trigger: 'blur' },
        ],
      } as FormRules,
      showTransferDialog: false,
      transferring: false,
      deleting: false,
      members: [] as any[],
      transferForm: {
        newOwnerId: '',
      },
    }
  },
  computed: {
    currentTeamId() {
      return this.$teamStore?.currentTeamId || null
    },
    currentUserRole(): string {
      const currentUserId = localStorage.getItem('userId')
      const currentMember = this.members.find((m: any) => m.userId === currentUserId || m.id === currentUserId)
      return currentMember?.role || 'member'
    },
    isOwner(): boolean {
      return this.currentUserRole === 'owner'
    },
  },
  mounted() {
    this.loadTeamSettings()
    this.loadMembers()
  },
  methods: {
    async loadTeamSettings() {
      if (!this.currentTeamId) return
      try {
        const result = await getTeamSettingsApi({ teamId: this.currentTeamId })
        this.teamInfo = {
          id: result.teamId,
          name: result.teamName,
        }
        this.editForm.name = result.teamName
        this.settings = {
          allowShare: result.allowShare,
          inviteMethod: result.inviteMethod,
        }
      } catch {
        // 错误已在 request 拦截器中处理
      }
    },
    async loadMembers() {
      if (!this.currentTeamId) return
      try {
        const result = await getTeamMembersApi({ teamUuid: this.currentTeamId })
        this.members = result || []
      } catch {
        // 错误已在 request 拦截器中处理
      }
    },
    async openTransferDialog() {
      await this.loadMembers()
      this.transferForm.newOwnerId = ''
      this.showTransferDialog = true
    },
    async handleTransferTeam() {
      if (!this.transferForm.newOwnerId || !this.currentTeamId) {
        ElMessage.warning('请选择要转让的成员')
        return
      }
      try {
        await ElMessageBox.confirm(
          '确定要将团队所有权转让给该成员吗？转让后您将不再是团队所有者。',
          '确认转让',
          { type: 'warning' }
        )
        this.transferring = true
        await transferTeamApi({
          teamUuid: this.currentTeamId,
          userUuid: this.transferForm.newOwnerId,
        })
        this.showTransferDialog = false
        ElMessage.success('团队已成功转让')
        this.loadTeamSettings()
        this.loadMembers()
      } catch {
        // 用户取消或请求失败
      } finally {
        this.transferring = false
      }
    },
    async handleDeleteTeam() {
      if (!this.currentTeamId) return
      try {
        await ElMessageBox.confirm(
          `确定要解散团队「${this.teamInfo.name}」吗？此操作不可恢复，所有团队数据将被删除。`,
          '确认解散',
          { type: 'error', confirmButtonText: '确认解散' }
        )
        this.deleting = true
        await deleteTeamApi({ teamUuid: this.currentTeamId })
        ElMessage.success('团队已解散')
        this.$teamStore.removeMyTeam(this.currentTeamId)
      } catch (error: any) {
        if (error !== 'cancel') {
          console.error('解散团队失败:', error)
        }
      } finally {
        this.deleting = false
      }
    },
    async handleSettingChange() {
      if (!this.currentTeamId) return
      try {
        await updateTeamSettingsApi({
          teamId: this.currentTeamId,
          allowShare: this.settings.allowShare,
          inviteMethod: this.settings.inviteMethod,
        })
        ElMessage.success('设置已保存')
      } catch {
        // 错误已在 request 拦截器中处理
      }
    },
    async handleSaveName() {
      const valid = await this.formRef?.validate().catch(() => false)
      if (!valid || !this.currentTeamId) return

      this.saving = true
      try {
        await updateTeamApi({
          teamId: this.currentTeamId,
          teamName: this.editForm.name,
        })
        this.teamInfo.name = this.editForm.name
        this.showEditNameDialog = false
        ElMessage.success('团队名称已更新')
        // 更新 store 中的团队名称
        this.$teamStore.updateTeamName(this.currentTeamId, this.editForm.name)
      } catch {
        // 错误已在 request 拦截器中处理
      } finally {
        this.saving = false
      }
    },
  },
}
</script>

<style scoped>
.team-settings-panel {
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

.settings-section {
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.settings-section:last-child {
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

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

.setting-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.setting-name {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  min-width: 200px;
}

.setting-id {
  font-size: 13px;
  color: #9ca3af;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  letter-spacing: 0.5px;
}

.view-only {
  font-size: 13px;
  color: #9ca3af;
}

.setting-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.setting-desc {
  font-size: 13px;
  color: #6b7280;
}

.invite-select {
  width: 200px;
}

.invite-select :deep(.el-select__wrapper) {
  background-color: #409EFF !important;
  border: 1px solid #409EFF !important;
  box-shadow: none !important;
}

.invite-select :deep(.el-select__wrapper:hover),
.invite-select :deep(.el-select__wrapper.is-focused) {
  background-color: #409EFF !important;
  border-color: #409EFF !important;
  box-shadow: none !important;
}

.invite-select :deep(.el-select__selection) {
  color: #ffffff !important;
  font-weight: 500;
}

.invite-select :deep(.el-select__selected-item) {
  color: #ffffff !important;
}

.invite-select :deep(.el-select__placeholder) {
  color: #ffffff !important;
}

.invite-select :deep(.el-select__icon) {
  color: #ffffff !important;
}

.invite-select :deep(.el-icon) {
  color: #ffffff !important;
}

.invite-select :deep(.el-input__inner) {
  color: #ffffff !important;
}

.setting-item--danger {
  border-color: #fecaca;
  background: #fef2f2;
}

.setting-item--danger:hover {
  border-color: #fca5a5;
}

.transfer-dialog-content {
  padding: 8px 0;
}

.transfer-tip {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
}

.transfer-select {
  width: 100%;
}

.member-option {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
