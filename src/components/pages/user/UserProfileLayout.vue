<template>
  <div class="personal-profile-page" v-loading="loading">
    <UserProfileNav :user="getUserSummary()" @command="handleNavCommand" />

    <div class="personal-profile-page__shell">
      <nav class="personal-profile-page__aside" aria-label="个人设置子导航">
        <el-menu
          class="personal-profile-page__menu"
          :default-active="activeMenuKey"
          @select="handleMenuSelect"
        >
          <el-menu-item index="personal">
            <el-icon class="personal-profile-page__menu-icon"><User /></el-icon>
            <span class="personal-profile-page__menu-label">个人信息</span>
          </el-menu-item>
          <el-menu-item index="security">
            <el-icon class="personal-profile-page__menu-icon"><Lock /></el-icon>
            <span class="personal-profile-page__menu-label">账户安全</span>
          </el-menu-item>
        </el-menu>
      </nav>

      <main class="personal-profile-page__main" aria-label="设置详情内容">
        <UserSecurityPanel v-if="isSecurityPanel" />
        <UserProfilePanel v-else />
      </main>
    </div>

    <AvatarCropDialog
      v-model="cropDialogVisible"
      :file="pendingCropFile"
      @confirm="onAvatarCropConfirm"
    />
  </div>
</template>

<script lang="ts">
import type { UploadFile } from 'element-plus'
import { buildDefaultAvatarSvgDataUrl, getNicknameInitialLetter } from '@/utils/defaultAvatar'
import UserProfileNav from '@/components/pages/user/UserProfileNav.vue'
import AvatarCropDialog from '@/components/pages/user/dialog/AvatarCropDialog.vue'
import UserProfilePanel from '@/components/pages/user/UserProfilePanel.vue'
import UserSecurityPanel from '@/components/pages/user/UserSecurityPanel.vue'
import type { UserSummary } from '@/types/user'
import { uploadCurrentUserAvatarApi } from '@/api/user'

type AvatarCropConfirmPayload = {
  dataUrl: string
  blob: Blob
}

export default {
  name: 'UserProfileLayout',
  components: { UserProfileNav, AvatarCropDialog, UserProfilePanel, UserSecurityPanel },
  provide() {
    return {
      profileLayout: this,
    }
  },
  data() {
    return {
      loading: false,
      avatarPreviewDataUrl: null as string | null,
      cropDialogVisible: false,
      pendingCropFile: null as File | null,
    }
  },
  computed: {
    user() {
      return this.$userStore.user
    },
    isSecurityPanel(): boolean {
      return this.$route.name === 'user-profile-security'
    },
    profileDisplayName(): string {
      const u = this.user
      if (!u) return '—'
      const nick = String(u.nickName ?? '').trim()
      const un = String(u.userName ?? '').trim()
      return nick || un || '—'
    },
    nicknameInitial(): string {
      const u = this.user
      if (!u) return '?'
      return getNicknameInitialLetter(u.nickName, u.userName)
    },
    displayAvatarSrc(): string {
      if (this.avatarPreviewDataUrl) return this.avatarPreviewDataUrl
      const a = this.user?.avatar
      if (a && String(a).trim()) return String(a).trim()
      return buildDefaultAvatarSvgDataUrl(this.nicknameInitial)
    },
    activeMenuKey(): string {
      return this.isSecurityPanel ? 'security' : 'personal'
    },
  },
  watch: {
    cropDialogVisible(val: boolean) {
      if (!val) {
        this.pendingCropFile = null
      }
    },
  },
  methods: {
    handleMenuSelect(key: string) {
      if (key === 'security') return this.$router.push('/profile-security')
      return this.$router.push('/profile-personal')
    },
    getUserSummary(): UserSummary | null {
      const u = this.user
      if (!u) return null
      const preview = this.avatarPreviewDataUrl
      const storeAvatar = u.avatar && String(u.avatar).trim() ? String(u.avatar).trim() : ''
      return {
        userName: u.userName || '',
        nickName: u.nickName || '',
        avatar: preview || storeAvatar,
      }
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
    handleNavCommand(cmd: string) {
      // 顶栏头像菜单：集中处理跳转，避免组件间相互依赖
      if (cmd === 'team') return this.$router.push('/team')
      if (cmd === 'userInfo') {
        return this.$router.push('/profile-personal')
      }
      if (cmd === 'logout') return this.handleLogout()
      ElMessage.info('功能开发中')
    },
    handleAvatarFileChange(uploadFile: UploadFile) {
      const raw = uploadFile.raw
      if (!raw) return
      if (!/^image\//.test(raw.type)) {
        ElMessage.warning('请选择图片文件')
        return
      }
      if (raw.size > 5 * 1024 * 1024) {
        ElMessage.warning('图片大小请勿超过 5MB')
        return
      }
      this.pendingCropFile = raw
      this.cropDialogVisible = true
    },
    async onAvatarCropConfirm(payload: AvatarCropConfirmPayload) {
      // 先展示本地预览，上传成功后再用后端返回的 OSS URL 覆盖
      this.avatarPreviewDataUrl = payload.dataUrl
      this.loading = true
      try {
        const file = new File([payload.blob], `avatar_${Date.now()}.jpg`, {
          type: payload.blob.type || 'image/jpeg',
        })
        const result = await uploadCurrentUserAvatarApi(file)
        const avatar = result.data?.avatar ? String(result.data.avatar).trim() : ''
        if (!this.$userStore.user) {
          await this.$userStore.fetchCurrentUser()
        }
        this.$userStore.updateAvatar(avatar)
        // 真实头像已更新：清理预览态，避免"预览图"与 OSS 真实图不一致
        this.avatarPreviewDataUrl = null
        ElMessage.success('头像上传成功')
      } catch {
        // 上传失败：回滚预览，避免用户误以为已保存
        this.avatarPreviewDataUrl = null
        ElMessage.error('头像上传失败')
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.personal-profile-page {
  height: 100%;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #ffffff;
}

.personal-profile-page__shell {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: row;
  overflow: hidden;
}

.personal-profile-page__aside {
  flex: 0 0 240px;
  width: 240px;
  background: #ffffff;
  border-right: 1px solid #eef0f3;
  overflow: auto;
  padding: 8px;
}

.personal-profile-page__menu {
  border-right: none;
}

.personal-profile-page__aside :deep(.el-menu-item) {
  height: 44px;
  line-height: 44px;
  border-radius: 6px;
  margin: 2px 6px;
  color: #4b5563;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.personal-profile-page__aside :deep(.el-menu-item:hover) {
  background: #f5f8ff;
  color: #1d4ed8;
}

.personal-profile-page__aside :deep(.el-menu-item.is-active) {
  background: #e8f0ff;
  color: #1d4ed8;
}

.personal-profile-page__aside :deep(.el-menu-item.is-active .personal-profile-page__menu-label) {
  font-weight: 700;
}

.personal-profile-page__menu-icon {
  margin-right: 10px;
  color: inherit;
}

.personal-profile-page__menu-label {
  font-size: 16px;
  color: inherit;
}

.personal-profile-page__main {
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

.personal-profile-page__main > :deep(*) {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
</style>
