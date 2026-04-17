<template>
  <div class="team-members-panel">
    <div class="panel-header">
      <h2 class="panel-title">团队成员</h2>
    </div>

    <el-tabs v-model="activeTab" class="members-tabs">
      <!-- 现有成员 -->
      <el-tab-pane label="现有成员" name="current">
        <div class="panel-toolbar">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索成员"
            clearable
            class="search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" @click="handleInviteClick">
            <el-icon><Plus /></el-icon>
            邀请成员
          </el-button>
        </div>

        <div class="panel-content">
          <el-table :data="filteredMembers" stripe>
            <el-table-column label="成员" min-width="200">
              <template #default="{ row }">
                <div class="member-cell">
                  <el-avatar :size="36" :src="row.avatar">
                    {{ row.nickName?.charAt(0) || '?' }}
                  </el-avatar>
                  <div class="member-info">
                    <span class="member-name">{{ row.nickName || row.userName }}</span>
                    <span class="member-email">{{ row.email || '-' }}</span>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="角色" width="120">
              <template #default="{ row }">
                <el-tag :type="getRoleTagType(row.role)" size="small">
                  {{ getRoleLabel(row.role) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="加入时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.joinedAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button
                  v-if="isOwner && row.role !== 'owner'"
                  link
                  type="primary"
                  @click="handleEditRole(row)"
                >
                  编辑角色
                </el-button>
                <el-button
                  v-if="isOwner && row.role !== 'owner'"
                  link
                  type="danger"
                  @click="handleRemoveMember(row)"
                >
                  移除
                </el-button>
                <span v-else class="no-action">-</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- 待加入成员 -->
      <el-tab-pane label="待加入成员" name="pending">
        <div class="panel-content">
          <el-table :data="pendingMembers" stripe>
            <el-table-column label="成员" min-width="200">
              <template #default="{ row }">
                <div class="member-cell">
                  <el-avatar :size="36" :src="row.avatar">
                    {{ row.nickName?.charAt(0) || '?' }}
                  </el-avatar>
                  <div class="member-info">
                    <span class="member-name">{{ row.nickName || row.userName }}</span>
                    <span class="member-email">{{ row.email || '-' }}</span>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="120">
              <template #default="{ row }">
                <el-tag :type="row.status === 'pending' ? 'warning' : 'info'" size="small">
                  {{ row.status === 'pending' ? '待加入' : '待审核' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="邀请人" width="120">
              <template #default="{ row }">
                {{ row.inviterName || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="邀请时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.invitedAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <template v-if="isOwner && row.status === 'reviewing'">
                  <el-button link type="primary" @click="handleApproveMember(row)">
                    同意
                  </el-button>
                  <el-button link type="danger" @click="handleRejectMember(row)">
                    拒绝
                  </el-button>
                </template>
                <span v-else class="no-action">-</span>
              </template>
            </el-table-column>
          </el-table>
          <div v-if="pendingMembers.length === 0" class="empty-state">
            暂无待加入成员
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 邀请成员对话框 -->
    <el-dialog v-model="showInviteDialog" title="邀请成员" width="480px">
      <div class="invite-dialog-content">
        <el-form
          ref="inviteFormRef"
          :model="inviteForm"
          :rules="inviteRules"
          label-position="top"
        >
          <el-form-item label="邮箱或手机号" prop="account">
            <el-input
              v-model="inviteForm.account"
              placeholder="请输入邮箱或手机号"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="showInviteDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSendInvite" :loading="sendingInvite">
          发送邀请
        </el-button>
      </template>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog v-model="showEditRoleDialog" title="编辑角色" width="400px">
      <div class="edit-role-content">
        <div class="member-preview">
          <el-avatar :size="40" :src="editingMember?.avatar">
            {{ editingMember?.nickName?.charAt(0) || '?' }}
          </el-avatar>
          <div class="member-info">
            <span class="member-name">{{ editingMember?.nickName || editingMember?.userName }}</span>
            <span class="member-email">{{ editingMember?.email || '-' }}</span>
          </div>
        </div>
        <div class="role-select">
          <label>选择角色</label>
          <el-radio-group v-model="selectedRole" class="role-radio-group">
            <el-radio :value="0">
              <div class="role-option">
                <span class="role-name">成员</span>
                <span class="role-desc">可以查看和参与团队项目</span>
              </div>
            </el-radio>
            <el-radio :value="1">
              <div class="role-option">
                <span class="role-name">管理员</span>
                <span class="role-desc">可以管理团队成员和项目</span>
              </div>
            </el-radio>
          </el-radio-group>
        </div>
      </div>
      <template #footer>
        <el-button @click="showEditRoleDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSaveRole" :loading="savingRole">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import {
  getTeamMembersApi,
  getPendingMembersApi,
  getTeamSettingsApi,
  inviteMemberApi,
  updateMemberRoleApi,
  removeMemberApi,
  reviewMemberApi,
} from '@/api/team'

interface TeamMember {
  id: string
  userId?: string
  userName: string
  nickName: string
  email: string | null
  avatar: string
  role: 'owner' | 'admin' | 'member'
  joinedAt: string
}

interface PendingMember {
  id: string
  userId?: string
  userName: string
  nickName: string
  email: string | null
  avatar: string
  status: 'pending' | 'reviewing'
  inviterName: string
  invitedAt: string
}

export default {
  name: 'TeamMembersPanel',
  data() {
    return {
      activeTab: 'current',
      searchKeyword: '',
      showInviteDialog: false,
      inviteForm: {
        account: '',
      },
      inviteRules: {
        account: [
          { required: true, message: '请输入邮箱或手机号', trigger: 'blur' },
          {
            validator: (rule: any, value: string, callback: any) => {
              if (!value) {
                callback(new Error('请输入邮箱或手机号'))
                return
              }
              // 验证邮箱或手机号（手机号：11位数字，以1开头）
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
              const phoneRegex = /^1[3-9]\d{9}$/
              if (!emailRegex.test(value) && !phoneRegex.test(value)) {
                callback(new Error('请输入有效的邮箱或手机号'))
                return
              }
              callback()
            },
            trigger: 'blur',
          },
        ],
      },
      sendingInvite: false,
      inviteMethod: 'owner' as 'owner' | 'approval' | 'all',
      members: [] as TeamMember[],
      pendingMembers: [] as PendingMember[],
      showEditRoleDialog: false,
      editingMember: null as TeamMember | null,
      selectedRole: 0 as number,  // 0: 成员, 1: 管理员
      savingRole: false,
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
    canInvite(): boolean {
      // owner: 仅所有者可邀请
      // approval: 需要所有者批准（所有成员都可以发起邀请，但需要批准）
      // all: 不需要批准（所有成员都可以直接邀请）
      if (this.inviteMethod === 'owner') {
        return this.isOwner
      }
      // approval 和 all 模式下所有成员都可以发起邀请
      return true
    },
    filteredMembers(): TeamMember[] {
      if (!this.searchKeyword.trim()) return this.members
      const keyword = this.searchKeyword.toLowerCase()
      return this.members.filter(
        (m) =>
          m.nickName?.toLowerCase().includes(keyword) ||
          m.userName?.toLowerCase().includes(keyword) ||
          m.email?.toLowerCase().includes(keyword)
      )
    },
  },
  mounted() {
    this.loadMembers()
    this.loadPendingMembers()
    this.loadTeamSettings()
  },
  methods: {
    async loadTeamSettings() {
      if (!this.currentTeamId) return
      try {
        const result = await getTeamSettingsApi({ teamId: this.currentTeamId })
        this.inviteMethod = result.data?.settings?.inviteMethod || 'owner'
      } catch {
        this.inviteMethod = 'owner'
      }
    },
    handleInviteClick() {
      if (!this.canInvite) {
        ElMessage.warning('您没有权限邀请成员')
        return
      }
      this.showInviteDialog = true
    },
    async loadMembers() {
      if (!this.currentTeamId) return
      try {
        const result = await getTeamMembersApi({ teamUuid: this.currentTeamId })
        this.members = (result.data?.members || []).map((m: any) => ({
          id: m.userId || m.id,
          userName: m.userName,
          nickName: m.nickName,
          email: m.email,
          avatar: m.avatar || '',
          role: m.role,
          joinedAt: m.joinedAt,
        }))
      } catch {
        // 错误已在 request 拦截器中处理
      }
    },
    async loadPendingMembers() {
      if (!this.currentTeamId) return
      try {
        const result = await getPendingMembersApi({ teamId: this.currentTeamId })
        this.pendingMembers = (result.data?.pendingMembers || []).map((m: any) => ({
          id: m.userId || m.id,
          userName: m.userName,
          nickName: m.nickName,
          email: m.email,
          avatar: m.avatar || '',
          status: m.status,
          inviterName: m.inviterName,
          invitedAt: m.invitedAt,
        }))
      } catch {
        // 错误已在 request 拦截器中处理
      }
    },
    getRoleLabel(role: string): string {
      const labels: Record<string, string> = {
        owner: '所有者',
        admin: '管理员',
        member: '成员',
      }
      return labels[role] || role
    },
    getRoleTagType(role: string): '' | 'success' | 'warning' | 'info' | 'danger' {
      const types: Record<string, '' | 'success' | 'warning' | 'info' | 'danger'> = {
        owner: 'danger',
        admin: 'warning',
        member: 'info',
      }
      return types[role] || ''
    },
    formatDate(dateStr: string): string {
      if (!dateStr) return '-'
      return new Date(dateStr).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    },
    canManageMember(member: TeamMember): boolean {
      return member.role !== 'owner'
    },
    canRemoveMember(member: TeamMember): boolean {
      return member.role !== 'owner'
    },
    handleEditRole(member: TeamMember) {
      this.editingMember = member
      // role: 0=成员, 1=管理员
      if (member.role === 'owner' || member.role === 'admin') {
        this.selectedRole = 1
      } else {
        this.selectedRole = 0
      }
      this.showEditRoleDialog = true
    },
    async handleSaveRole() {
      if (!this.editingMember || !this.currentTeamId) return

      this.savingRole = true
      try {
        await updateMemberRoleApi({
          teamUuid: this.currentTeamId,
          userUuid: this.editingMember.id,
          role: this.selectedRole,
        })

        // 更新本地数据
        const index = this.members.findIndex((m) => m.id === this.editingMember!.id)
        if (index !== -1) {
          this.members[index].role = this.selectedRole === 1 ? 'admin' : 'member'
        }

        this.showEditRoleDialog = false
        ElMessage.success('角色已更新')
      } catch {
        // 错误已在 request 拦截器中处理
      } finally {
        this.savingRole = false
      }
    },
    async handleRemoveMember(member: TeamMember) {
      if (!this.currentTeamId) return
      try {
        await ElMessageBox.confirm(
          `确定要将 ${member.nickName || member.userName} 移出团队吗？`,
          '确认移除',
          { type: 'warning' }
        )
        await removeMemberApi({
          teamUuid: this.currentTeamId,
          userUuid: member.id,
        })
        this.members = this.members.filter((m) => m.id !== member.id)
        ElMessage.success('已移除成员')
      } catch {
        // 用户取消或请求失败
      }
    },
    async handleApproveMember(member: PendingMember) {
      if (!this.currentTeamId) return
      try {
        await reviewMemberApi({
          inviteUuid: member.id,
          status: 1,
        })

        // 从待加入列表移除
        this.pendingMembers = this.pendingMembers.filter((m) => m.id !== member.id)

        // 添加到成员列表
        this.members.push({
          id: member.id,
          userName: member.userName,
          nickName: member.nickName,
          email: member.email,
          avatar: member.avatar,
          role: 'member',
          joinedAt: new Date().toISOString(),
        })

        ElMessage.success(`已同意 ${member.nickName || member.userName} 加入团队`)
      } catch {
        // 错误已在 request 拦截器中处理
      }
    },
    async handleRejectMember(member: PendingMember) {
      if (!this.currentTeamId) return
      try {
        await ElMessageBox.confirm(
          `确定拒绝 ${member.nickName || member.userName} 加入团队吗？`,
          '确认拒绝',
          { type: 'warning' }
        )
        await reviewMemberApi({
          inviteUuid: member.id,
          status: 0,
        })
        this.pendingMembers = this.pendingMembers.filter((m) => m.id !== member.id)
        ElMessage.success('已拒绝加入请求')
      } catch {
        // 用户取消或请求失败
      }
    },
    async handleSendInvite() {
      if (!this.canInvite) {
        ElMessage.warning('您没有权限邀请成员')
        return
      }

      const formRef = this.$refs.inviteFormRef as any
      if (!formRef) return

      try {
        const valid = await formRef.validate()
        if (!valid) return
      } catch {
        return
      }

      if (!this.currentTeamId) return

      const account = this.inviteForm.account.trim()

      // 检查是否已在团队成员中（根据邮箱或手机号）
      const existingMember = this.members.find(
        (m) => m.email?.toLowerCase() === account.toLowerCase() || m.email === account
      )
      if (existingMember) {
        ElMessage.warning(`该成员已在团队中`)
        return
      }

      // 检查是否已在待加入列表中
      const existingPending = this.pendingMembers.find(
        (m) => m.email?.toLowerCase() === account.toLowerCase() || m.email === account
      )
      if (existingPending) {
        ElMessage.warning(`该成员已在待加入列表中`)
        return
      }

      this.sendingInvite = true
      try {
        await inviteMemberApi({
          teamUuid: this.currentTeamId,
          inviteeUserUuid: account,  // 邮箱或手机号作为邀请对象的标识
        })

        this.showInviteDialog = false
        this.inviteForm.account = ''
        ElMessage.success(`邀请已发送`)
        // 刷新待加入成员列表
        this.loadPendingMembers()
      } catch {
        // 错误已在 request 拦截器中处理
      } finally {
        this.sendingInvite = false
      }
    },
  },
}
</script>

<style scoped>
.team-members-panel {
  background: #ffffff;
  border-radius: 8px;
  padding: 24px;
}

.panel-header {
  margin-bottom: 20px;
}

.panel-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.panel-desc {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.panel-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 16px;
}

.search-input {
  max-width: 400px;
}

.members-tabs {
  margin-top: -8px;
}

.members-tabs :deep(.el-tabs__header) {
  margin-bottom: 16px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
  font-size: 14px;
}

.no-action {
  color: #9ca3af;
}

.member-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.member-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.member-name {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.member-email {
  font-size: 12px;
  color: #9ca3af;
}

.invite-dialog-content {
  padding: 8px 0;
}

/* 编辑角色对话框样式 */
.edit-role-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.member-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.role-select label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 12px;
}

.role-radio-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.role-radio-group :deep(.el-radio) {
  display: flex;
  align-items: center;
  width: 100%;
  height: 68px;
  padding: 12px 16px;
  margin-right: 0;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.role-radio-group :deep(.el-radio:hover) {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.role-radio-group :deep(.el-radio.is-checked) {
  background: #eff6ff;
  border-color: #3b82f6;
}

.role-radio-group :deep(.el-radio__input) {
  margin-top: 0;
}

.role-radio-group :deep(.el-radio__label) {
  flex: 1;
  padding-left: 8px;
  display: flex;
  align-items: center;
}

.role-option {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  width: 100%;
}

.role-name {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  line-height: 20px;
}

.role-desc {
  font-size: 12px;
  color: #9ca3af;
  line-height: 18px;
}
</style>
