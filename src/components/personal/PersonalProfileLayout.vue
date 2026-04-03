<script lang="ts">
import type { UploadFile } from 'element-plus'
import { buildDefaultAvatarSvgDataUrl, getNicknameInitialLetter } from '@/utils/defaultAvatar'
import PersonalProfileNav from '@/components/nav/PersonalProfileNav.vue'
import AvatarCropDialog from '@/components/personal/dialog/AvatarCropDialog.vue'
import type { UserSummary } from '@/types/user'
import { uploadCurrentUserAvatarApi } from '@/api/user'

type AvatarCropConfirmPayload = {
  dataUrl: string
  blob: Blob
}

export default {
  name: 'PersonalProfileLayout',
  components: { PersonalProfileNav, AvatarCropDialog },
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
        // 真实头像已更新：清理预览态，避免“预览图”与 OSS 真实图不一致
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

<template>
  <div class="personal-profile-page" v-loading="loading">
    <PersonalProfileNav :user="getUserSummary()" @command="handleNavCommand" />

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
              <span>账户安全</span>
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
  color: var(--app-brand-primary);
  font-weight: 600;
  background: rgba(13, 71, 107, 0.06);
  box-shadow: inset 4px 0 0 var(--app-brand-primary);
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
