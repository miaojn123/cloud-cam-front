<script lang="ts">
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores'
import { isDesktopEmbed } from '@/utils/desktopBridge'
import { pushWithDesktopQuery } from '@/utils/desktopNav'
import { isRegisterPasswordValid } from '@/utils/passwordPolicy'

export default {
  name: 'RegisterPage',
  data() {
    return {
      email: '',
      password: '',
      username: '',
      emailCode: '',
      /** 是否同意服务条款与隐私政策（必选） */
      agreeTerms: false,
      emailCountdown: 0,
      passwordTouched: false,
      emailTouched: false,
      emailCodeTouched: false,
      usernameTouched: false
    }
  },
  computed: {
    /** Qt 内嵌或 ?client=desktop 时为 true；Web 独立访问为 false（与登录页一致） */
    isDesktopEmbedMode() {
      return isDesktopEmbed(this.$route.query)
    },
    passwordValid() {
      if (!this.password) return true
      return isRegisterPasswordValid(this.password)
    },
    emailValid() {
      if (!this.email) return true
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)
    },
    registerPasswordHintText() {
      if (this.passwordTouched && !this.password) return '请输入密码'
      return '8-32位字符，且至少包含一个数字和一个字母'
    },
    registerPasswordHasError() {
      return this.passwordTouched && (!this.password || !this.passwordValid)
    }
  },
  methods: {
    async sendEmailCode() {
      try {
        const userStore = useUserStore()
        await userStore.sendRegisterCode(this.email)
        ElMessage.success('验证码已发送')
        this.emailCountdown = 60
        const timer = setInterval(() => {
          this.emailCountdown--
          if (this.emailCountdown <= 0) {
            clearInterval(timer)
          }
        }, 1000)
      } catch {
        ElMessage.error('发送验证码失败')
      }
    },
    async submitRegister() {
      if (!this.agreeTerms) {
        ElMessage.warning('请阅读并勾选同意服务条款与隐私政策')
        return
      }
      // 中文注释：注册页不允许空输入，优先在输入框下方展示提示（避免只弹 Message）。
      this.emailTouched = true
      this.emailCodeTouched = true
      this.passwordTouched = true
      this.usernameTouched = true

      if (!this.email || !this.emailValid) return
      if (!this.emailCode.trim()) return
      if (!this.password || !this.passwordValid) return
      if (!this.username.trim()) return
      try {
        const userStore = useUserStore()
        await userStore.registerByCode(
          this.email.trim(),
          this.emailCode.trim(),
          this.password,
          this.username.trim()
        )
        ElMessage.success('注册成功，请登录')
        pushWithDesktopQuery(this.$router, this.$route.query, '/login')
      } catch {
        ElMessage.error('注册失败')
      }
    },
    goToLogin() {
      pushWithDesktopQuery(this.$router, this.$route.query, '/login')
    },
    onPasswordBlur() {
      this.passwordTouched = true
    },
    onEmailBlur() {
      this.emailTouched = true
    },
    onEmailCodeBlur() {
      this.emailCodeTouched = true
    },
    onUsernameBlur() {
      this.usernameTouched = true
    }
  }
}
</script>

<template>
  <div
    class="signup-container"
    :class="{
      'signup-container--web-bg': !isDesktopEmbedMode,
      'signup-container--desktop': isDesktopEmbedMode
    }"
  >
    <div
      class="signup-main"
      :class="{ 'signup-main--web-frame': !isDesktopEmbedMode }"
    >
      <!-- Signup Form -->
      <div class="signup-content">
        <!-- 图标与标题同一行居中 -->
        <div class="page-heading">
          <a href="#" class="app-logo">
            <img src="/qjcam-logo.png" alt="QJCAM" class="app-logo-img" />
          </a>
          <h1 class="title">创建账户</h1>
        </div>

        <div class="auth-form-card">
          <el-form @submit.prevent="submitRegister" class="signup-form">
            <!-- Email -->
            <el-form-item class="form-item-custom">
              <template #label>
                <label class="custom-label">邮箱地址</label>
              </template>
              <el-input
                v-model="email"
                type="email"
                placeholder="请输入邮箱"
                autocomplete="email"
                class="custom-input"
                @blur="onEmailBlur"
              />
              <!-- 预留提示区域：避免错误提示出现时表单抖动 -->
              <div class="auth-input-hint" :class="{ 'auth-input-hint--error': emailTouched && !emailValid }">
                {{ emailTouched && !emailValid ? '请输入正确邮箱' : '\u00A0' }}
              </div>
            </el-form-item>

            <!-- Email Verification Code -->
            <el-form-item class="form-item-custom">
              <template #label>
                <label class="custom-label">邮箱验证码</label>
              </template>
              <div class="code-input-wrapper">
                <el-input
                  v-model="emailCode"
                  placeholder="请输入验证码"
                  autocomplete="one-time-code"
                  class="custom-input code-input"
                  @blur="onEmailCodeBlur"
                />
                <el-button
                  type="primary"
                  class="send-code-btn"
                  :disabled="emailCountdown > 0"
                  @click="sendEmailCode"
                >
                  {{ emailCountdown > 0 ? `${emailCountdown}s` : '获取验证码' }}
                </el-button>
              </div>
              <!-- 预留提示区域：避免错误提示出现/消失导致布局抖动 -->
              <div
                class="auth-input-hint"
                :class="{ 'auth-input-hint--error': emailCodeTouched && !emailCode.trim() }"
              >
                {{ emailCodeTouched && !emailCode.trim() ? '请输入验证码' : '\u00A0' }}
              </div>
            </el-form-item>

            <!-- Password -->
            <el-form-item class="form-item-custom">
              <template #label>
                <label class="custom-label">输入密码</label>
              </template>
              <el-input
                v-model="password"
                type="password"
                placeholder="请输入密码"
                autocomplete="new-password"
                show-password
                class="custom-input"
                @blur="onPasswordBlur"
              />
              <div
                class="auth-input-hint"
                :class="{ 'auth-input-hint--error': registerPasswordHasError }"
              >
                {{ registerPasswordHintText }}
              </div>
            </el-form-item>

            <!-- Username -->
            <el-form-item class="form-item-custom">
              <template #label>
                <label class="custom-label">输入用户名</label>
              </template>
              <el-input
                v-model="username"
                type="text"
                placeholder="用户名"
                autocomplete="username"
                class="custom-input"
                @blur="onUsernameBlur"
              />
              <!-- 预留提示区域：避免错误提示出现/消失导致布局抖动 -->
              <div
                class="auth-input-hint"
                :class="{ 'auth-input-hint--error': usernameTouched && !username.trim() }"
              >
                {{ usernameTouched && !username.trim() ? '请输入用户名' : '\u00A0' }}
              </div>
            </el-form-item>

            <!-- 同意条款（必选，勾选后才可点击创建账户） -->
            <el-form-item class="form-item-custom checkbox-group">
              <el-checkbox v-model="agreeTerms" class="custom-checkbox">
                <span class="checkbox-text">
                  创建账户即表示您同意我们的
                  <el-link type="primary" underline="never" href="#" @click.prevent>服务条款</el-link>
                  和
                  <el-link type="primary" underline="never" href="#" @click.prevent>隐私政策</el-link>。
                </span>
              </el-checkbox>
            </el-form-item>

            <el-form-item class="form-item-custom submit-item">
              <el-button
                type="primary"
                native-type="submit"
                class="create-account-btn"
                :disabled="!agreeTerms"
              >
                创建账户
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
.signup-container {
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
.signup-container.signup-container--desktop {
  justify-content: center;
}

/* Web：全屏背景 + 内容区靠右（与登录页一致） */
.signup-container.signup-container--web-bg {
  background-image: url('/background.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  align-items: flex-end;
  padding-right: clamp(24px, 10vw, 120px);
  padding-left: 16px;
}

@media (max-width: 640px) {
  .signup-container.signup-container--web-bg {
    align-items: center;
    padding-right: 16px;
  }
}

.signup-main {
  width: 100%;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* WEB：白底外框随内容高度，带阴影；Qt 不加 */
.signup-main.signup-main--web-frame {
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
  .signup-main.signup-main--web-frame {
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
.signup-content {
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
.signup-form {
  border-radius: 6px;
}

.form-item-custom {
  margin-bottom: 0px !important;
}

/* 创建账户按钮：收紧与勾选区、下方登录入口的间距 */
.submit-item {
  margin-top: 4px !important;
  margin-bottom: 2px !important;
}

/* 覆盖 Element Plus Form 样式 */
.signup-form :deep(.el-form-item) {
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.signup-form :deep(.el-form-item__label) {
  padding: 0 !important;
  line-height: 1.5 !important;
  width: 100% !important;
  text-align: left !important;
  justify-content: flex-start !important;
  margin-bottom: 0 !important;
  height:24px;
}

.signup-form :deep(.el-form-item__content) {
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
.signup-form :deep(.el-input) {
  --el-input-border: #d0d7de;
  --el-input-border-color: #d0d7de;
  --el-input-bg-color: #ffffff;
  --el-input-text-color: var(--auth-text);
  --el-input-placeholder-color: var(--auth-text-muted);
  --el-input-hover-border: #d0d7de;
  --el-input-focus-border: #0969da;
}

.signup-form :deep(.el-input__wrapper) {
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

.signup-form :deep(.el-input__wrapper:hover) {
  border-color: #d0d7de !important;
  box-shadow: none !important;
}

.signup-form :deep(.el-input__wrapper.is-focus) {
  border-color: #0969da !important;
  box-shadow: inset 0 0 0 1px #0969da !important;
}

.signup-form :deep(.el-input__inner) {
  height: auto !important;
  line-height: 19px !important;
  color: var(--auth-text) !important;
  font-size: var(--auth-fs-input) !important;
}

.signup-form :deep(.el-input__inner::placeholder) {
  color: #6e7781 !important;
}

/* 密码输入框的图标 */
.signup-form :deep(.el-input__suffix) {
  height: 32px;
}

.signup-form :deep(.el-input__suffix-inner) {
  height: 32px;
  display: flex;
  align-items: center;
}

.signup-form :deep(.el-input__icon) {
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
  font-size: var(--auth-fs-small);
  color: var(--auth-text-muted);
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
  font-size: 12px !important;
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

/* Checkbox */
.checkbox-group {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}

.custom-checkbox {
  display: flex;
  align-items: flex-start;
}

.signup-form :deep(.el-checkbox__label) {
  display: inline-flex;
  align-items: center;
  font-size: var(--auth-fs-small) !important;
  color: var(--auth-text-muted) !important;
  line-height: 1.5 !important;
  padding-left: 8px !important;
}

.signup-form :deep(.el-checkbox__inner) {
  width: 16px !important;
  height: 16px !important;
  border: 1px solid #d0d7de !important;
  border-radius: 3px !important;
  background-color: #ffffff !important;
}

.signup-form :deep(.el-checkbox__inner::after) {
  height: 8px !important;
  left: 4.5px !important;
  top: 1px !important;
  width: 4px !important;
  border: 1.5px solid #fff !important;
  border-left: 0 !important;
  border-top: 0 !important;
  background: transparent !important;
  transform: rotate(45deg) translate(1px, 0.5px) !important;
}

.signup-form :deep(.el-checkbox.is-checked .el-checkbox__inner) {
  background-color: #0969da !important;
  border-color: #0969da !important;
}

.signup-form :deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
  color: #656d76 !important;
}

.checkbox-text {
  font-size: 12px !important;
  color: #656d76 !important;
  line-height: 1.5 !important;
}

.checkbox-text :deep(.el-link__inner) {
  color: #0969da !important;
  font-size: 12px !important;
}

.checkbox-text :deep(.el-link:hover .el-link__inner) {
  text-decoration: underline !important;
}

/* Button */
.create-account-btn {
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

.create-account-btn:hover:not(:disabled) {
  filter: brightness(1.05);
}

.create-account-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  filter: none;
}

/* Sign In Link */
.signin-link {
  margin-top: 10px;
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
