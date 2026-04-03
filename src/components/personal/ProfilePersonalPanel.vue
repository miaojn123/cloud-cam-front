<script lang="ts">
import type { FormInstance, FormRules, UploadFile, UploadInstance } from 'element-plus'
import {
  updateCurrentUserIndustryApi,
  updateCurrentUserNickNameApi,
  updateCurrentUserOrganizationApi,
  updateCurrentUserUserNameApi,
} from '@/api/user'
import { userNameFormRules } from '@/utils/validators'

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
      return this.$userStore.user
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
    const rules: FormRules = {
      userName: userNameFormRules,
      nickName: [
        { required: true, message: '昵称不能为空', trigger: 'blur' },
        { min: 6, max: 20, message: '昵称长度应为 6-20 个字符', trigger: 'blur' },
      ],
      companyOrSchool: [{ max: 50, message: '组织长度不能超过 50 个字符', trigger: 'blur' }],
      industry: [{ max: 50, message: '专业长度不能超过 50 个字符', trigger: 'blur' }],
    }
    return {
      /** 本地编辑态（保存接口待对接） */
      profileForm: {
        userName: '',
        nickName: '',
        companyOrSchool: '',
        industry: '',
      },
      saving: {
        userName: false,
        nickName: false,
        organization: false,
        industry: false,
      },
      lastSaved: {
        userName: '',
        nickName: '',
        organization: '',
        industry: '',
      },
      profileRules: rules,
    }
  },
  watch: {
    user: {
      immediate: true,
      handler(
        u: { userName?: string; nickName?: string; organization?: string | null; industry?: string | null } | null
      ) {
        if (!u) return
        this.profileForm.userName = String(u.userName ?? '').trim()
        this.profileForm.nickName = String(u.nickName ?? '').trim()
        const org = String(u.organization ?? '').trim()
        const ind = String(u.industry ?? '').trim()
        this.profileForm.companyOrSchool = org
        this.profileForm.industry = ind
        // 刷新/重进页面时用后端已保存值作为“脏检查”基准，避免默认值不显示或误发请求
        this.lastSaved.userName = this.profileForm.userName
        this.lastSaved.nickName = this.profileForm.nickName
        this.lastSaved.organization = org
        this.lastSaved.industry = ind
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
    normalizeText(value: unknown): string {
      return typeof value === 'string' ? value.trim() : String(value ?? '').trim()
    },
    getFormRef(): FormInstance | undefined {
      return this.$refs.profileFormRef as FormInstance | undefined
    },
    async validateFieldOk(prop: string): Promise<boolean> {
      const form = this.getFormRef()
      if (!form) return false
      try {
        // validateField 失败会抛错，通过则继续
        await form.validateField(prop as any)
        return true
      } catch {
        return false
      }
    },
    syncStoreProfile(patch: Partial<{ userName: string; nickName: string }>) {
      const current = this.$userStore?.user
      if (!current) return
      this.$userStore.user = { ...current, ...patch }
    },
    handleAvatarFileChange(uploadFile: UploadFile) {
      this.layout.handleAvatarFileChange(uploadFile)
    },
    async onUserNameBlur() {
      const next = this.normalizeText(this.profileForm.userName)
      this.profileForm.userName = next
      if (next === this.lastSaved.userName) return
      if (this.saving.userName) return
      const ok = await this.validateFieldOk('userName')
      if (!ok) return
      this.saving.userName = true
      try {
        await updateCurrentUserUserNameApi(next)
        this.lastSaved.userName = next
        this.syncStoreProfile({ userName: next })
        ElMessage.success('修改成功')
      } catch {
        this.profileForm.userName = this.lastSaved.userName
      } finally {
        this.saving.userName = false
      }
    },
    async onNickNameBlur() {
      const next = this.normalizeText(this.profileForm.nickName)
      this.profileForm.nickName = next
      if (next === this.lastSaved.nickName) return
      if (this.saving.nickName) return
      const ok = await this.validateFieldOk('nickName')
      if (!ok) return
      this.saving.nickName = true
      try {
        await updateCurrentUserNickNameApi(next)
        this.lastSaved.nickName = next
        this.syncStoreProfile({ nickName: next })
        ElMessage.success('修改成功')
      } catch {
        this.profileForm.nickName = this.lastSaved.nickName
      } finally {
        this.saving.nickName = false
      }
    },
    async onOrganizationBlur() {
      const next = this.normalizeText(this.profileForm.companyOrSchool)
      this.profileForm.companyOrSchool = next
      if (next === this.lastSaved.organization) return
      if (this.saving.organization) return
      // 组织允许为空（0-50）；为空时不做校验提示，但若发生变化仍要提交清空请求
      if (next) {
        const ok = await this.validateFieldOk('companyOrSchool')
        if (!ok) return
      }
      this.saving.organization = true
      try {
        await updateCurrentUserOrganizationApi(next)
        this.lastSaved.organization = next
        ElMessage.success('修改成功')
      } catch {
        this.profileForm.companyOrSchool = this.lastSaved.organization
      } finally {
        this.saving.organization = false
      }
    },
    async onIndustryBlur() {
      const next = this.normalizeText(this.profileForm.industry)
      this.profileForm.industry = next
      if (next === this.lastSaved.industry) return
      if (this.saving.industry) return
      // 专业允许为空（0-50）；为空时不做校验提示，但若发生变化仍要提交清空请求
      if (next) {
        const ok = await this.validateFieldOk('industry')
        if (!ok) return
      }
      this.saving.industry = true
      try {
        await updateCurrentUserIndustryApi(next)
        this.lastSaved.industry = next
        ElMessage.success('修改成功')
      } catch {
        this.profileForm.industry = this.lastSaved.industry
      } finally {
        this.saving.industry = false
      }
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
        <el-form
          ref="profileFormRef"
          class="profile-form"
          aria-labelledby="profile-form-heading"
          :model="profileForm"
          :rules="profileRules"
          @submit.prevent
        >
          <div class="profile-form-head">
            <h2 id="profile-form-heading" class="profile-form-heading">详细信息</h2>
            <div class="profile-form-head-rule" role="presentation" />
          </div>
          <el-form-item class="profile-form-field" prop="userName">
            <label class="profile-form-label" for="profile-user-name">用户名</label>
            <el-input
              id="profile-user-name"
              v-model.trim="profileForm.userName"
              class="profile-form-control"
              autocomplete="username"
              maxlength="20"
              show-word-limit
              :disabled="saving.userName"
              @blur="onUserNameBlur"
            />
          </el-form-item>
          <el-form-item class="profile-form-field" prop="nickName">
            <label class="profile-form-label" for="profile-nick-name">昵称</label>
            <el-input
              id="profile-nick-name"
              v-model.trim="profileForm.nickName"
              class="profile-form-control"
              autocomplete="nickname"
              maxlength="20"
              show-word-limit
              :disabled="saving.nickName"
              @blur="onNickNameBlur"
            />
          </el-form-item>
          <el-form-item class="profile-form-field" prop="companyOrSchool">
            <label class="profile-form-label" for="profile-company-school">所属公司/机构/学校</label>
            <el-input
              id="profile-company-school"
              v-model.trim="profileForm.companyOrSchool"
              class="profile-form-control"
              autocomplete="organization"
              maxlength="50"
              show-word-limit
              :disabled="saving.organization"
              @blur="onOrganizationBlur"
            />
          </el-form-item>
          <el-form-item class="profile-form-field" prop="industry">
            <label class="profile-form-label" for="profile-industry">所属行业</label>
            <el-input
              id="profile-industry"
              v-model.trim="profileForm.industry"
              class="profile-form-control"
              maxlength="50"
              show-word-limit
              :disabled="saving.industry"
              @blur="onIndustryBlur"
            />
          </el-form-item>
          <div class="profile-form-field">
            <div class="profile-storage-title">存储空间</div>
            <div class="profile-storage-title-rule" role="presentation" />
            <div class="profile-storage-row" role="group" aria-label="存储空间使用情况">
              <div class="profile-storage-bar" aria-hidden="true">
                <div class="profile-storage-bar__fill" />
              </div>
              <div class="profile-storage-percent">15.71%</div>
              <div class="profile-storage-usage">1.57G / 10G</div>
            </div>
          </div>
        </el-form>
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
  outline: 2px solid var(--app-brand-primary);
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
  margin-bottom: 24px;
}

.profile-storage-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 10px;
}

.profile-storage-title-rule {
  width: 100%;
  height: 0;
  border: 0;
  border-top: 1px solid gray;
  margin: 0 0 14px;
}

.profile-storage-row {
  display: flex;
  align-items: center;
  gap: 18px;
}

.profile-storage-bar {
  width: 66.6667%;
  height: 24px;
  border: 1px solid #3b82f6;
  border-radius: 999px;
  background: #ffffff;
  overflow: hidden;
  box-sizing: border-box;
}

.profile-storage-bar__fill {
  height: 100%;
  width: 15.71%;
  background: lightgray;
  border-radius: 999px;
}

.profile-storage-percent {
  min-width: 78px;
  font-size: 14px;
  color: #4b5563;
}

.profile-storage-usage {
  margin-left: auto;
  font-size: 14px;
  color: #4b5563;
  white-space: nowrap;
}

.profile-form-field:last-child {
  margin-bottom: 0;
}

.profile-form-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 1.35;
  font-weight: 400;
  color: #4b5563;
}

.profile-form-control {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

/* el-input 自带 wrapper，这里只改 wrapper/inner，避免出现“双边框” */
.profile-form-control :deep(.el-input__wrapper) {
  width: 100%;
  box-sizing: border-box;
  padding: 0 12px;
  min-height: 42px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  box-shadow: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.profile-form-control :deep(.el-input__inner) {
  font-size: 14px;
  line-height: 1.45;
  color: #111827;
}

.profile-form-control :deep(.el-input__inner::placeholder) {
  color: #9ca3af;
}

.profile-form-control :deep(.el-input__wrapper:hover) {
  border-color: #d1d5db;
}

.profile-form-control :deep(.el-input__wrapper.is-focus) {
  border-color: var(--app-brand-primary);
  box-shadow: 0 0 0 1px rgba(13, 71, 107, 0.15);
}

.profile-form-field--contact .profile-form-contact-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px 10px;
  min-height: 42px;
  padding: 9px 12px;
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
  font-size: 14px;
  color: #111827;
}

.profile-form-link {
  flex-shrink: 0;
  margin-left: auto;
  padding: 0;
  border: none;
  background: none;
  color: var(--app-brand-primary);
  font-size: 14px;
  cursor: pointer;
  text-decoration: none;
}

.profile-form-link:hover {
  color: var(--app-brand-primary-hover);
}
</style>
