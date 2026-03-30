<script lang="ts">
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores'
import { isDesktopEmbed } from '@/utils/desktopBridge'
import { pushWithDesktopQuery } from '@/utils/desktopNav'
import { isResetPasswordValid } from '@/utils/passwordPolicy'

export default {
  name: 'ResetPassword',
  data() {
    return {
      account: '',
      code: '',
      password: '',
      confirmPassword: '',
      countdown: 0,
      passwordTouched: false,
      confirmPasswordTouched: false,
      accountTouched: false
    }
  },
  computed: {
    /** Qt 内嵌或 ?client=desktop 时为 true；Web 独立访问为 false（与登录页一致） */
    isDesktopEmbedMode() {
      return isDesktopEmbed(this.$route.query)
    },
    passwordValid() {
      if (!this.password) return true
      return isResetPasswordValid(this.password)
    },
    confirmPasswordValid() {
      if (!this.confirmPassword) return true
      return this.password === this.confirmPassword
    },
    accountValid() {
      if (!this.account) return true
      const s = this.account.trim()
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
      const phoneOk = /^1\d{10}$/.test(s)
      return emailOk || phoneOk
    }
  },
  methods: {
    async sendCode() {
      this.accountTouched = true
      if (!this.account.trim()) {
        ElMessage.warning('请先输入邮箱')
        return
      }
      if (!this.accountValid) {
        ElMessage.warning('请输入正确的邮箱')
        return
      }
      try {
        const userStore = useUserStore()
        await userStore.sendResetCode(this.account.trim())
        ElMessage.success('验证码已发送')
        this.countdown = 60
        const timer = setInterval(() => {
          this.countdown--
          if (this.countdown <= 0) {
            clearInterval(timer)
          }
        }, 1000)
      } catch {
        ElMessage.error('发送验证码失败')
      }
    },
    async resetPassword() {
      this.accountTouched = true
      this.passwordTouched = true
      this.confirmPasswordTouched = true
      if (!this.account.trim()) {
        ElMessage.warning('请输入邮箱')
        return
      }
      if (!this.accountValid) {
        ElMessage.warning('请输入正确的邮箱')
        return
      }
      if (!this.code.trim()) {
        ElMessage.warning('请输入验证码')
        return
      }
      if (!this.password || !this.passwordValid) {
        ElMessage.warning('密码需为 8-32 位，且至少包含字母与数字')
        return
      }
      if (!this.confirmPasswordValid) {
        ElMessage.warning('两次输入的密码不一致')
        return
      }
      try {
        const userStore = useUserStore()
        const result = await userStore.resetPassword(
          this.account.trim(),
          this.code.trim(),
          this.password
        )
        const msg = typeof result?.msg === 'string' ? result.msg : ''
        ElMessage.success(msg || '密码重置成功')
        pushWithDesktopQuery(this.$router, this.$route.query, '/login')
      } catch {
        // 业务错误由 http 拦截器提示；此处保留静默
      }
    },
    goToLogin() {
      pushWithDesktopQuery(this.$router, this.$route.query, '/login')
    },
    onPasswordBlur() {
      this.passwordTouched = true
    },
    onConfirmPasswordBlur() {
      this.confirmPasswordTouched = true
    },
    onAccountBlur() {
      this.accountTouched = true
    }
  }
}
</script>

<template>
  <div
    class="reset-container"
    :class="{
      'reset-container--web-bg': !isDesktopEmbedMode,
      'reset-container--desktop': isDesktopEmbedMode
    }"
  >
    <div
      class="reset-main"
      :class="{ 'reset-main--web-frame': !isDesktopEmbedMode }"
    >
      <!-- Reset Form -->
      <div class="reset-content">
        <!-- 图标与标题同一行居中 -->
        <div class="page-heading">
          <a href="#" class="app-logo">
            <img src="/qjcam-logo.png" alt="QJCAM" class="app-logo-img" />
          </a>
          <h1 class="title">重置密码</h1>
        </div>

        <div class="auth-form-card">
          <el-form @submit.prevent class="reset-form">
            <el-form-item class="form-item-custom">
              <template #label>
                <label class="custom-label">邮箱</label>
              </template>
              <el-input
                v-model="account"
                type="text"
                placeholder="请输入邮箱"
                autocomplete="username"
                class="custom-input"
                @blur="onAccountBlur"
              />
              <!-- 预留提示区域：避免错误提示出现/消失导致布局抖动 -->
              <div
                class="auth-input-hint"
                :class="{ 'auth-input-hint--error': accountTouched && !accountValid }"
              >
                {{ accountTouched && !accountValid ? '请输入正确的邮箱' : '\u00A0' }}
              </div>
            </el-form-item>

            <el-form-item class="form-item-custom">
              <template #label>
                <label class="custom-label">验证码</label>
              </template>
              <div class="code-input-wrapper">
                <el-input
                  v-model="code"
                  placeholder="请输入验证码"
                  autocomplete="one-time-code"
                  class="custom-input code-input"
                />
                <el-button
                  type="primary"
                  class="send-code-btn"
                  :disabled="countdown > 0"
                  @click="sendCode"
                >
                  {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
                </el-button>
              </div>
            </el-form-item>

            <el-form-item class="form-item-custom">
              <template #label>
                <label class="custom-label">新密码</label>
              </template>
              <el-input
                v-model="password"
                type="password"
                placeholder="请输入新密码"
                autocomplete="new-password"
                show-password
                class="custom-input"
                @blur="onPasswordBlur"
              />
              <div class="auth-input-hint" :class="{ 'auth-input-hint--error': passwordTouched && !passwordValid }">
                8-32 位字符，且至少包含一个数字和一个字母
              </div>
            </el-form-item>

            <el-form-item class="form-item-custom">
              <template #label>
                <label class="custom-label">确认新密码</label>
              </template>
              <el-input
                v-model="confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                autocomplete="new-password"
                show-password
                class="custom-input"
                @blur="onConfirmPasswordBlur"
              />
              <!-- 预留提示区域：避免错误提示出现/消失导致布局抖动 -->
              <div
                class="auth-input-hint"
                :class="{ 'auth-input-hint--error': confirmPasswordTouched && !confirmPasswordValid }"
              >
                {{ confirmPasswordTouched && !confirmPasswordValid ? '两次输入的密码不一致' : '\u00A0' }}
              </div>
            </el-form-item>

            <el-form-item class="form-item-custom submit-item">
              <el-button type="primary" class="reset-btn" @click="resetPassword">
                重置密码
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- Sign In Link -->
        <div class="signin-link">
          已有账户？ <el-link type="primary" underline="never" @click="goToLogin">登录</el-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reset-container {
  box-sizing: border-box;
  min-height: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  padding: 12px 16px 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
  font-size: var(--auth-fs-root);
  overflow: hidden;
}

/* Qt 内嵌：垂直居中（与原生窗口/固定尺寸的视觉更一致） */
.reset-container.reset-container--desktop {
  justify-content: center;
}

/* Web：全屏背景 + 内容区靠右（与登录页一致） */
.reset-container.reset-container--web-bg {
  background-image: url('/background.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  align-items: flex-end;
  padding-right: clamp(24px, 10vw, 120px);
  padding-left: 16px;
}

@media (max-width: 640px) {
  .reset-container.reset-container--web-bg {
    align-items: center;
    padding-right: 16px;
  }
}

.reset-main {
  width: 100%;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* WEB：白底外框随内容高度，带阴影；Qt 不加 */
.reset-main.reset-main--web-frame {
  flex: 0 0 auto;
  align-self: flex-end;
  max-width: var(--auth-web-frame-max-width);
  width: 100%;
  margin-inline: 0;
  padding: var(--auth-web-frame-pad-top) var(--auth-web-frame-pad-x)
    var(--auth-web-frame-pad-bottom);
  box-sizing: border-box;
  border: 1px solid #d8dee4;
  border-radius: 8px;
  background-color: #ffffff;
  box-shadow:
    0 4px 6px rgba(15, 23, 42, 0.06),
    0 12px 28px rgba(15, 23, 42, 0.12);
}

@media (max-width: 640px) {
  .reset-main.reset-main--web-frame {
    align-self: center;
  }
}

.page-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  width: 100%;
}

.app-logo {
  color: var(--auth-text-title);
  text-decoration: none;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.app-logo:hover {
  color: #656d76;
}

.app-logo-img {
  display: block;
  height: 32px;
  width: auto;
  max-width: 120px;
  object-fit: contain;
}

/* Content */
.reset-content {
  width: 100%;
  max-width: 340px;
  margin: 0 auto;
  padding: 0;
}

.page-heading .title {
  font-size: var(--auth-fs-title);
  font-weight: 400;
  color: var(--auth-text-title);
  margin: 0;
  line-height: 1.2;
  text-align: right;
  flex-shrink: 0;
}

/* Form */
.reset-form {
  border-radius: 6px;
}

.form-item-custom {
  margin-bottom: 12px !important;
}

.submit-item {
  margin-top: 12px !important;
}

/* 覆盖 Element Plus Form 样式 */
.reset-form :deep(.el-form-item) {
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.reset-form :deep(.el-form-item__label) {
  padding: 0 !important;
  line-height: 1.5 !important;
  width: 100% !important;
  text-align: left !important;
  justify-content: flex-start !important;
  margin-bottom: 0 !important;
  height:24px;
}

.reset-form :deep(.el-form-item__content) {
  width: 100%;
  margin-left: 0 !important;
}

.custom-label {
  display: block;
  font-size: var(--auth-fs-label) !important;
  font-weight: 400 !important;
  color: var(--auth-text) !important;
  margin-bottom: 4px;
  text-align: left;
  line-height: 1.5 !important;
}

/* 覆盖 Element Plus Input 样式 */
.reset-form :deep(.el-input) {
  --el-input-border: #d0d7de;
  --el-input-border-color: #d0d7de;
  --el-input-bg-color: #ffffff;
  --el-input-text-color: var(--auth-text);
  --el-input-placeholder-color: var(--auth-text-muted);
  --el-input-hover-border: #d0d7de;
  --el-input-focus-border: #0969da;
}

.reset-form :deep(.el-input__wrapper) {
  width: 100%;
  padding: 0 12px !important;
  height: 32px !important;
  font-size: var(--auth-fs-input) !important;
  background-color: #ffffff !important;
  border: 1px solid #d0d7de !important;
  border-radius: 6px !important;
  box-shadow: none !important;
  display: flex !important;
  align-items: center !important;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s !important;
}

.reset-form :deep(.el-input__wrapper:hover) {
  border-color: #d0d7de !important;
  box-shadow: none !important;
}

.reset-form :deep(.el-input__wrapper.is-focus) {
  border-color: #0969da !important;
  box-shadow: inset 0 0 0 1px #0969da !important;
}

.reset-form :deep(.el-input__inner) {
  height: auto !important;
  line-height: 19px !important;
  color: var(--auth-text) !important;
  font-size: var(--auth-fs-input) !important;
}

.reset-form :deep(.el-input__inner::placeholder) {
  color: #6e7781 !important;
}

/* 密码输入框的图标 */
.reset-form :deep(.el-input__suffix) {
  height: 32px;
}

.reset-form :deep(.el-input__suffix-inner) {
  height: 32px;
  display: flex;
  align-items: center;
}

.reset-form :deep(.el-input__icon) {
  height: 32px;
  line-height: 32px;
}

.code-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.code-input {
  width: 100%;
}

.code-input :deep(.el-input__wrapper) {
  padding-right: 100px !important;
}

.password-hint {
  font-size: 12px;
  color: #8b949e;
  margin-top: 4px;
  line-height: 1.5;
}

.password-hint-error {
  color: #cf222e;
}

/* 覆盖 Element Plus Button 样式 */
.send-code-btn {
  position: absolute;
  right: 7px;
  top: 50%;
  transform: translateY(-50%);
  padding: 4px 10px !important;
  font-size: var(--auth-fs-small) !important;
  font-weight: 400 !important;
  line-height: 20px !important;
  height: 26px !important;
  min-height: 26px !important;
  --el-button-bg-color: #0969da !important;
  --el-button-border-color: #0969da !important;
  --el-button-text-color: #ffffff !important;
  --el-button-hover-bg-color: #0866c8 !important;
  --el-button-hover-border-color: #0866c8 !important;
  --el-button-disabled-bg-color: #8b949e !important;
  --el-button-disabled-border-color: #8b949e !important;
  --el-button-disabled-text-color: #ffffff !important;
  background-color: #0969da !important;
  border-color: #0969da !important;
  border-radius: 4px !important;
  cursor: pointer;
  transition: all 0.2s !important;
  white-space: nowrap;
}

.send-code-btn:hover:not(:disabled) {
  background-color: #0866c8 !important;
  border-color: #0866c8 !important;
}

.send-code-btn:disabled {
  background-color: #8b949e !important;
  border-color: #8b949e !important;
  cursor: not-allowed;
}

.reset-btn {
  width: 100%;
  padding: 6px 16px !important;
  font-size: var(--auth-fs-input) !important;
  font-weight: 500 !important;
  line-height: 20px !important;
  height: 32px !important;
  /* 主按钮统一样式：渐变背景 + 无边框 + 圆角 10px */
  background-image: linear-gradient(to right, #8317bd, #61abff) !important;
  background-color: transparent !important;
  border: none !important;
  border-radius: 10px !important;
  color: #ffffff !important;
  cursor: pointer;
  transition: filter 0.2s !important;
}

.reset-btn:hover {
  filter: brightness(1.05);
}

/* Sign In Link */
.signin-link {
  margin-top: 12px;
  padding: 8px 16px;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  text-align: center;
  font-size: var(--auth-fs-input);
  color: var(--auth-text);
  background-color: #f6f8fa;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
}

.signin-link :deep(.el-link__inner) {
  color: #0969da !important;
  font-size: var(--auth-fs-input) !important;
}

.signin-link :deep(.el-link:hover .el-link__inner) {
  text-decoration: underline !important;
}
</style>
