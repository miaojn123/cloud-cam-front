<script lang="ts">
import type { UploadFile, UploadInstance } from 'element-plus'

type ProfileLayoutInject = {
  displayAvatarSrc: string
  profileDisplayName: string
  handleAvatarFileChange: (uploadFile: UploadFile) => void
  cropDialogVisible: boolean
}

export default {
  name: 'ProfilePersonalPanel',
  inject: ['profileLayout'],
  computed: {
    layout(): ProfileLayoutInject {
      return this.profileLayout as ProfileLayoutInject
    },
    user() {
      return this.$userStore.currentUser
    },
    profileEmailDisplay(): string {
      const e = this.user?.email
      return e && String(e).trim() ? String(e).trim() : '未绑定邮箱'
    },
    profilePhoneDisplay(): string {
      const p = this.user?.phone
      return p && String(p).trim() ? String(p).trim() : '未绑定手机'
    },
  },
  data() {
    return {
      /** 本地编辑态（保存接口待对接） */
      profileForm: {
        userName: '',
        nickName: '',
        companyOrSchool: '',
        industry: '',
      },
    }
  },
  watch: {
    user: {
      immediate: true,
      handler(u: { userName?: string; nickName?: string } | null) {
        if (!u) return
        this.profileForm.userName = String(u.userName ?? '').trim()
        this.profileForm.nickName = String(u.nickName ?? '').trim()
      },
    },
    'profileLayout.cropDialogVisible'(val: boolean) {
      if (!val) {
        this.$nextTick(() => {
          const ref = this.$refs.avatarUploadRef as UploadInstance | undefined
          ref?.clearFiles()
        })
      }
    },
  },
  methods: {
    handleAvatarFileChange(uploadFile: UploadFile) {
      this.layout.handleAvatarFileChange(uploadFile)
    },
    goBindPhone() {
      this.$router.push({ path: '/personalProfile/security', query: { bind: 'phone' } })
    },
    goBindEmail() {
      this.$router.push({ path: '/personalProfile/security', query: { bind: 'email' } })
    },
  },
}
</script>

<template>
  <div class="profile-personal-panel">
    <div class="personal-profile-page__card personal-profile-page__card--personal">
      <section class="profile-identity-row" aria-label="用户基本信息">
        <el-upload
          ref="avatarUploadRef"
          class="profile-avatar-upload"
          :show-file-list="false"
          :auto-upload="false"
          accept="image/png,image/jpeg,image/webp,image/gif"
          :on-change="handleAvatarFileChange"
        >
          <template #default>
            <span class="profile-avatar-btn" aria-label="更换头像">
              <span class="profile-avatar-circle">
                <img
                  :src="layout.displayAvatarSrc"
                  alt=""
                  class="profile-avatar-img"
                />
                <span class="profile-avatar-mask">
                  <span class="profile-avatar-hint">更换头像</span>
                </span>
              </span>
            </span>
          </template>
        </el-upload>
        <div class="profile-identity-text">
          <div class="profile-display-name">{{ layout.profileDisplayName }}</div>
          <div class="profile-email-row">
            <el-icon class="profile-email-icon" :size="16">
              <EpPostcard />
            </el-icon>
            <span class="profile-email-text">{{ profileEmailDisplay }}</span>
          </div>
        </div>
      </section>

      <div class="profile-card-body">
        <form class="profile-form" aria-labelledby="profile-form-heading" @submit.prevent>
          <div class="profile-form-head">
            <h2 id="profile-form-heading" class="profile-form-heading">详细信息</h2>
            <div class="profile-form-head-rule" role="presentation" />
          </div>
          <div class="profile-form-field">
            <label class="profile-form-label" for="profile-user-name">用户名</label>
            <input
              id="profile-user-name"
              v-model.trim="profileForm.userName"
              type="text"
              class="profile-form-control"
              autocomplete="username"
            />
          </div>
          <div class="profile-form-field">
            <label class="profile-form-label" for="profile-nick-name">昵称</label>
            <input
              id="profile-nick-name"
              v-model.trim="profileForm.nickName"
              type="text"
              class="profile-form-control"
              autocomplete="nickname"
            />
          </div>
          <div class="profile-form-field">
            <label class="profile-form-label" for="profile-company-school">所属公司/机构/学校</label>
            <input
              id="profile-company-school"
              v-model.trim="profileForm.companyOrSchool"
              type="text"
              class="profile-form-control"
              autocomplete="organization"
            />
          </div>
          <div class="profile-form-field">
            <label class="profile-form-label" for="profile-industry">所属行业</label>
            <input
              id="profile-industry"
              v-model.trim="profileForm.industry"
              type="text"
              class="profile-form-control"
            />
          </div>
          <div class="profile-form-field profile-form-field--contact">
            <span class="profile-form-label">手机号</span>
            <div class="profile-form-contact-row">
              <span class="profile-form-readonly">{{ profilePhoneDisplay }}</span>
              <button type="button" class="profile-form-link" @click="goBindPhone">
                前往修改
              </button>
            </div>
          </div>
          <div class="profile-form-field profile-form-field--contact">
            <span class="profile-form-label">邮箱</span>
            <div class="profile-form-contact-row">
              <span class="profile-form-readonly">{{ profileEmailDisplay }}</span>
              <button type="button" class="profile-form-link" @click="goBindEmail">
                前往修改
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-personal-panel {
  min-height: 0;
}

.personal-profile-page__card {
  max-width: 960px;
  min-height: 200px;
  padding: 24px;
  background: #ffffff;
  border: 1px solid #eef0f3;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.personal-profile-page__card--personal {
  padding: 0;
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
  max-width: none;
  display: flex;
  flex-direction: column;
}

.profile-identity-row {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 24px;
  background: #e8eaed;
  border-radius: 8px 8px 0 0;
}

.profile-avatar-upload {
  display: inline-block;
}

.profile-avatar-upload :deep(.el-upload) {
  display: inline-block;
  border: none;
}

.profile-avatar-btn {
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  border-radius: 50%;
  display: inline-block;
}

.profile-avatar-btn:focus-visible {
  outline: 2px solid #0d476b;
  outline-offset: 3px;
}

.profile-avatar-circle {
  position: relative;
  display: block;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  overflow: hidden;
  background: #4b5563;
}

.profile-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.profile-avatar-mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.38);
  color: #ffffff;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease;
}

.profile-avatar-circle:hover .profile-avatar-mask,
.profile-avatar-upload:focus-within .profile-avatar-mask {
  opacity: 1;
}

.profile-avatar-hint {
  font-size: 13px;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}

.profile-identity-text {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.profile-display-name {
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
}

.profile-email-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.profile-email-icon {
  color: #6b7280;
  flex-shrink: 0;
}

.profile-email-text {
  font-size: 14px;
  color: #4b5563;
}

.profile-card-body {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  overflow: auto;
  padding: 20px 24px;
  box-sizing: border-box;
}

/* 在 body 的 padding 内横向占满 */
.profile-form {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.profile-form-head {
  margin-bottom: 18px;
}

.profile-form-heading {
  margin: 0 0 10px;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.3;
  color: #111827;
}

.profile-form-head-rule {
  width: 100%;
  height: 0;
  border: 0;
  border-top: 1px solid gray;
  margin: 0;
}

.profile-form-field {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  margin-bottom: 16px;
}

.profile-form-field:last-child {
  margin-bottom: 0;
}

.profile-form-label {
  display: block;
  margin-bottom: 5px;
  font-size: 13px;
  line-height: 1.35;
  font-weight: 400;
  color: #4b5563;
}

.profile-form-control {
  display: block;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  padding: 7px 10px;
  font-size: 13px;
  line-height: 1.45;
  color: #111827;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.profile-form-control::placeholder {
  color: #9ca3af;
}

.profile-form-control:hover {
  border-color: #d1d5db;
}

.profile-form-control:focus {
  border-color: #0d476b;
  box-shadow: 0 0 0 1px rgba(13, 71, 107, 0.15);
}

.profile-form-field--contact .profile-form-contact-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px 10px;
  min-height: 34px;
  padding: 7px 10px;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
}

.profile-form-readonly {
  flex: 1 1 auto;
  min-width: 0;
  font-size: 13px;
  color: #111827;
}

.profile-form-link {
  flex-shrink: 0;
  margin-left: auto;
  padding: 0;
  border: none;
  background: none;
  color: #0d476b;
  font-size: 13px;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.profile-form-link:hover {
  color: #0b3e5e;
}
</style>
