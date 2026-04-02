<script lang="ts">
export default {
  name: 'ProfileSecurityPanel',
  data() {
    return {
      securityDialogVisible: false,
      securityDialogKind: null as 'phone' | 'email' | 'password' | null,
    }
  },
  computed: {
    securityDialogTitle(): string {
      switch (this.securityDialogKind) {
        case 'phone':
          return '修改手机号'
        case 'email':
          return '修改邮箱'
        case 'password':
          return '修改密码'
        default:
          return ''
      }
    },
    user() {
      return this.$userStore.user
    },
    profilePhoneDisplay(): string {
      const p = this.user?.phone
      return p && String(p).trim() ? String(p).trim() : '未绑定手机'
    },
    profileEmailDisplay(): string {
      const e = this.user?.email
      return e && String(e).trim() ? String(e).trim() : '未绑定邮箱'
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
      if (b === 'phone' || b === 'email') {
        ElMessage.info('功能开发中')
        this.$nextTick(() => {
          this.$router.replace({ path: '/personalProfile/security' })
        })
      }
    },
    onClickModify() {
      ElMessage.info('功能开发中')
    },
    /** 注销账户：确认后对接后端；当前仅占位 */
    async onDeactivateAccount() {
      ElMessage.info('功能开发中')
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
              <button type="button" class="profile-form-link" @click="onClickModify">
                前往修改
              </button>
            </div>
          </div>
          <div class="profile-form-field profile-form-field--contact">
            <span class="profile-form-label">邮箱</span>
            <div class="profile-form-contact-row">
              <span class="profile-form-readonly">{{ profileEmailDisplay }}</span>
              <button type="button" class="profile-form-link" @click="onClickModify">
                前往修改
              </button>
            </div>
          </div>
          <div class="profile-form-field profile-form-field--contact">
            <span class="profile-form-label">修改密码</span>
            <div class="profile-form-contact-row">
              <span class="profile-form-readonly profile-form-readonly--muted">
                通过已绑定手机或邮箱验证后设置新登录密码
              </span>
              <button type="button" class="profile-form-link" @click="onClickModify">
                前往修改
              </button>
            </div>
          </div>
          <div class="profile-form-field profile-form-field--contact">
            <span class="profile-form-label">注销账户</span>
            <div class="profile-form-contact-row">
              <span class="profile-form-readonly profile-form-readonly--muted">
                永久删除账号及关联数据（以平台规则为准）
              </span>
              <button type="button" class="profile-form-link profile-form-link--danger" @click="onDeactivateAccount">
                注销账户
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
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

.profile-form-link {
  flex-shrink: 0;
  margin-left: auto;
  padding: 0;
  border: none;
  background: none;
  color: gray;
  font-size: 14px;
  cursor: pointer;
  text-decoration: none;
}

.profile-form-link:hover {
  color: #0b3e5e;
}

.profile-form-link--danger {
  color: #b91c1c;
}

.profile-form-link--danger:hover {
  color: #991b1b;
}

.security-dialog-placeholder {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}
</style>
