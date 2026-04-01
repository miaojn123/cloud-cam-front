<script lang="ts">
import type { UploadFile } from 'element-plus'
import { buildDefaultAvatarSvgDataUrl, getNicknameInitialLetter } from '@/utils/defaultAvatar'
import AppMainNav from '@/components/layout/AppMainNav.vue'
import AvatarCropDialog from '@/components/profile/AvatarCropDialog.vue'
import type { UserSummary } from '@/types/user'

export default {
  name: 'PersonalProfileLayout',
  components: { AppMainNav, AvatarCropDialog },
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
      return this.$userStore.currentUser
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
  },
  watch: {
    cropDialogVisible(val: boolean) {
      if (!val) {
        this.pendingCropFile = null
      }
    },
  },
  async mounted() {
    if (!this.user) {
      this.loading = true
      try {
        await this.$userStore.fetchCurrentUser()
      } catch {
        ElMessage.error('获取用户信息失败')
      } finally {
        this.loading = false
      }
    }
  },
  methods: {
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
      if (cmd === 'userInfo') {
        return this.$router.push('/personalProfile/personal')
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
    onAvatarCropConfirm(payload: { dataUrl: string }) {
      this.avatarPreviewDataUrl = payload.dataUrl
      ElMessage.success('头像已更新（本地预览，保存接口待接入）')
    },
  },
}
</script>

<template>
  <div class="personal-profile-page" v-loading="loading">
    <AppMainNav :user="getUserSummary()" @command="handleNavCommand" />

    <div class="personal-profile-page__shell">
      <nav class="personal-profile-page__aside" aria-label="个人设置子导航">
        <ul class="personal-profile-page__menu" role="list">
          <li role="none">
            <router-link
              to="/personalProfile/personal"
              class="personal-profile-page__menu-item"
              active-class="is-active"
            >
              <el-icon class="personal-profile-page__menu-icon" :size="18">
                <EpUser />
              </el-icon>
              <span>个人信息</span>
            </router-link>
          </li>
          <li role="none">
            <router-link
              to="/personalProfile/security"
              class="personal-profile-page__menu-item"
              active-class="is-active"
            >
              <el-icon class="personal-profile-page__menu-icon" :size="18">
                <EpLock />
              </el-icon>
              <span>安全性</span>
            </router-link>
          </li>
        </ul>
      </nav>

      <main class="personal-profile-page__main" aria-label="设置详情内容">
        <router-view />
      </main>
    </div>

    <AvatarCropDialog
      v-model="cropDialogVisible"
      :file="pendingCropFile"
      @confirm="onAvatarCropConfirm"
    />
  </div>
</template>

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
}

.personal-profile-page__menu {
  list-style: none;
  margin: 0;
  padding: 12px 0;
}

.personal-profile-page__menu-item {
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

.personal-profile-page__menu-item:hover {
  background: #f3f4f6;
}

.personal-profile-page__menu-item.is-active {
  color: #0d476b;
  font-weight: 600;
  background: rgba(13, 71, 107, 0.06);
  box-shadow: inset 4px 0 0 #0d476b;
}

.personal-profile-page__menu-icon {
  flex-shrink: 0;
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
