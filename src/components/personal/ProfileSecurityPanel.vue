<script lang="ts">
import AccountDeactivateDialog from './security/AccountDeactivateDialog.vue'
import EmailBindDialog from './security/EmailBindDialog.vue'
import EmailUnbindDialog from './security/EmailUnbindDialog.vue'
import PhoneBindDialog from './security/PhoneBindDialog.vue'
import PhoneUnbindDialog from './security/PhoneUnbindDialog.vue'
import ChangePasswordDialog from './security/ChangePasswordDialog.vue'

function maskEmailForDisplay(email: string): string {
  const s = String(email ?? '').trim()
  const at = s.indexOf('@')
  if (at <= 0) return '***'
  const local = s.slice(0, at)
  const domain = s.slice(at + 1)
  if (!domain) return '***'
  const visible = local.slice(0, 3)
  return `${visible || '*'}***@${domain}`
}

export default {
  name: 'ProfileSecurityPanel',
  components: {
    AccountDeactivateDialog,
    EmailBindDialog,
    EmailUnbindDialog,
    PhoneBindDialog,
    PhoneUnbindDialog,
    ChangePasswordDialog,
  },
  data() {
    return {
      deactivateVisible: false,
      bindEmailVisible: false,
      unbindEmailVisible: false,
      bindPhoneVisible: false,
      unbindPhoneVisible: false,
      changePasswordVisible: false,
    }
  },
  computed: {
    user() {
      return this.$userStore.user
    },
    profilePhoneDisplay(): string {
      const p = this.user?.phone
      return p && String(p).trim() ? String(p).trim() : '未绑定手机'
    },
    profileEmailDisplay(): string {
      const e = this.user?.email
      return e && String(e).trim() ? maskEmailForDisplay(String(e)) : '未绑定邮箱'
    },
    emailActionText(): string {
      const e = this.user?.email
      return e && String(e).trim() ? '更改绑定' : '前往绑定'
    },
    phoneActionText(): string {
      const p = this.user?.phone
      return p && String(p).trim() ? '更改绑定' : '前往绑定'
    },
  },
  watch: {
    '$route.query': {
      handler() {
        this.syncBindFromQuery()
      },
      immediate: true,
    },
  },
  methods: {
    syncBindFromQuery() {
      const raw = this.$route.query.bind
      const b = Array.isArray(raw) ? raw[0] : raw
      if (b === 'phone') {
        this.onClickPhoneRow()
      }
      if (b === 'email') {
        this.onClickEmail()
      }
      if (b === 'phone' || b === 'email') {
        this.$nextTick(() => {
          this.$router.replace({ path: '/personalProfile/security' })
        })
      }
    },
    onClickPhoneRow() {
      const currentPhone = String(this.user?.phone ?? '').trim()
      if (!currentPhone) {
        this.bindPhoneVisible = true
        return
      }
      this.unbindPhoneVisible = true
    },
    onUnbindPhoneSuccess() {
      this.bindPhoneVisible = true
    },
    onClickChangePassword() {
      this.changePasswordVisible = true
    },
    onClickEmail() {
      const currentEmail = String(this.user?.email ?? '').trim()
      if (!currentEmail) {
        this.bindEmailVisible = true
        return
      }
      this.unbindEmailVisible = true
    },
    onUnbindEmailSuccess() {
      this.bindEmailVisible = true
    },
    onDeactivateAccount() {
      if (!this.user) {
        ElMessage.warning('未能获取用户信息')
        return
      }
      this.deactivateVisible = true
    },
  },
}
</script>

<template>
  <div class="profile-security-panel">
    <div class="personal-profile-page__card personal-profile-page__card--security">
      <div class="profile-card-body">
        <section class="profile-form" aria-labelledby="security-form-heading">
          <div class="profile-form-head">
            <h2 id="security-form-heading" class="profile-form-heading">账号与安全</h2>
            <div class="profile-form-head-rule" role="presentation" />
          </div>

          <div class="profile-form-field profile-form-field--contact">
            <span class="profile-form-label">手机号</span>
            <div class="profile-form-contact-row">
              <span class="profile-form-readonly">{{ profilePhoneDisplay }}</span>
              <el-button text class="profile-form-link" @click="onClickPhoneRow">
                {{ phoneActionText }}
              </el-button>
            </div>
          </div>
          <div class="profile-form-field profile-form-field--contact">
            <span class="profile-form-label">邮箱</span>
            <div class="profile-form-contact-row">
              <span class="profile-form-readonly">{{ profileEmailDisplay }}</span>
              <el-button text class="profile-form-link" @click="onClickEmail">
                {{ emailActionText }}
              </el-button>
            </div>
          </div>
          <div class="profile-form-field profile-form-field--contact">
            <span class="profile-form-label">修改密码</span>
            <div class="profile-form-contact-row">
              <span class="profile-form-readonly profile-form-readonly--muted">
                输入原密码后即可设置新登录密码
              </span>
              <el-button text class="profile-form-link" @click="onClickChangePassword">
                前往修改
              </el-button>
            </div>
          </div>
          <div class="profile-form-field profile-form-field--contact">
            <span class="profile-form-label">注销账户</span>
            <div class="profile-form-contact-row">
              <span class="profile-form-readonly profile-form-readonly--muted">
                永久删除账号及关联数据（以平台规则为准）
              </span>
              <el-button text class="profile-form-link profile-form-link--danger" @click="onDeactivateAccount">
                注销账户
              </el-button>
            </div>
          </div>
        </section>
      </div>
    </div>

    <EmailBindDialog v-model="bindEmailVisible" />
    <PhoneBindDialog v-model="bindPhoneVisible" />
    <ChangePasswordDialog v-model="changePasswordVisible" />
    <EmailUnbindDialog
      v-model="unbindEmailVisible"
      :current-email="String(user?.email ?? '').trim()"
      @success="onUnbindEmailSuccess"
    />
    <PhoneUnbindDialog
      v-model="unbindPhoneVisible"
      :current-phone="String(user?.phone ?? '').trim()"
      @success="onUnbindPhoneSuccess"
    />
    <AccountDeactivateDialog
      v-model="deactivateVisible"
      :user="user"
      :router="$router"
    />
  </div>
</template>

<style scoped>
.profile-security-panel {
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

.personal-profile-page__card--security {
  padding: 0;
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
  max-width: none;
  display: flex;
  flex-direction: column;
}

.profile-card-body {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  overflow: auto;
  padding: 20px 24px;
  box-sizing: border-box;
}

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

.profile-form-readonly--muted {
  color: #6b7280;
}

.profile-form-link.el-button.is-text {
  flex-shrink: 0;
  margin-left: auto;
  height: auto;
  min-height: 0;
  padding: 0;
  background-color: transparent;
  font-size: 14px;
  font-weight: 400;
  color: gray;
}

.profile-form-link.el-button.is-text:hover,
.profile-form-link.el-button.is-text:focus-visible {
  background-color: transparent;
  color: #0b3e5e;
}

.profile-form-link--danger.el-button.is-text {
  color: #b91c1c;
}

.profile-form-link--danger.el-button.is-text:hover,
.profile-form-link--danger.el-button.is-text:focus-visible {
  background-color: transparent;
  color: #991b1b;
}

.security-dialog-placeholder {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}
</style>
