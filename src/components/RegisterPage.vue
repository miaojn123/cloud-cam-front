<script lang="ts">
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores'

export default {
  name: 'RegisterPage',
  data() {
    return {
      email: '',
      password: '',
      username: '',
      emailCode: '',
      receiveUpdates: false,
      emailCountdown: 0,
      passwordTouched: false,
      emailTouched: false
    }
  },
  computed: {
    passwordValid() {
      if (!this.password) return true
      return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/.test(this.password)
    },
    emailValid() {
      if (!this.email) return true
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)
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
      if (!this.email || !this.emailCode || !this.password || !this.username) {
        ElMessage.warning('请完整填写注册信息')
        return
      }
      try {
        const userStore = useUserStore()
        await userStore.registerByCode(this.email, this.emailCode, this.password, this.username)
        ElMessage.success('注册成功，请登录')
        this.$router.push('/login')
      } catch {
        ElMessage.error('注册失败')
      }
    },
    goToLogin() {
      this.$router.push('/login')
    },
    onPasswordBlur() {
      this.passwordTouched = true
    },
    onEmailBlur() {
      this.emailTouched = true
    }
  }
}
</script>

<template>
  <div class="signup-container">
    <div class="signup-main">
      <!-- Header Logo -->
      <div class="header">
        <a href="#" class="qjcam-logo">
          <img src="/logo.ico" height="32" width="32" alt="Logo" />
        </a>
      </div>

      <!-- Signup Form -->
      <div class="signup-content">
        <h1 class="title">创建账户</h1>

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
            <div v-if="emailTouched && !emailValid" class="password-hint password-hint-error">
              请输入正确邮箱
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
            <div class="password-hint" :class="{ 'password-hint-error': passwordTouched && !passwordValid }">
              8-20位字符，且至少包含一个数字和一个字母
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
            />
          </el-form-item>

          <!-- Receive Updates -->
          <el-form-item class="form-item-custom checkbox-group">
            <el-checkbox v-model="receiveUpdates" class="custom-checkbox">
              <span class="checkbox-text">
                通过邮件接收产品更新和公告。
                <el-link type="primary" underline="never" class="text-link">您可以随时取消订阅</el-link>。
              </span>
            </el-checkbox>
          </el-form-item>

          <!-- Submit Button -->
          <el-form-item class="form-item-custom submit-item">
            <el-button type="primary" native-type="submit" class="create-account-btn">
              创建账户
            </el-button>
          </el-form-item>

          <!-- Terms Notice -->
          <p class="terms-notice">
            创建账户即表示您同意我们的
            <el-link type="primary" underline="never">服务条款</el-link> 和
            <el-link type="primary" underline="never">隐私政策</el-link>。
          </p>
        </el-form>

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
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
  font-size: 14px;
  overflow: hidden;
}

.signup-main {
  width: 100%;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Header */
.header {
  padding: 0 0 16px;
}

.qjcam-logo {
  color: #1f2328;
  text-decoration: none;
}

.qjcam-logo:hover {
  color: #656d76;
}

/* Content */
.signup-content {
  max-width: 340px;
  margin: 0 auto;
  padding: 0 16px;
}

.title {
  font-size: 24px;
  font-weight: 400;
  color: #1f2328;
  margin: 0 0 24px 0;
  text-align: center;
}

/* Form */
.signup-form {
  border-radius: 6px;
}

.form-item-custom {
  margin-bottom: 10px !important;
}

.submit-item {
  margin-top: 16px !important;
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
}

.signup-form :deep(.el-form-item__content) {
  width: 100%;
  margin-left: 0 !important;
}

.custom-label {
  display: block;
  font-size: 16px !important;
  font-weight: 400 !important;
  color: #1f2328 !important;
  margin-bottom: 4px;
  text-align: left;
  line-height: 1.5 !important;
}

/* 覆盖 Element Plus Input 样式 */
.signup-form :deep(.el-input) {
  --el-input-border: #d0d7de;
  --el-input-border-color: #d0d7de;
  --el-input-bg-color: #ffffff;
  --el-input-text-color: #1f2328;
  --el-input-placeholder-color: #6e7781;
  --el-input-hover-border: #d0d7de;
  --el-input-focus-border: #0969da;
}

.signup-form :deep(.el-input__wrapper) {
  width: 100%;
  padding: 1px 12px !important;
  font-size: 14px !important;
  line-height: 20px !important;
  background-color: #ffffff !important;
  border: 1px solid #d0d7de !important;
  border-radius: 6px !important;
  box-shadow: none !important;
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
  height: 32px !important;
  line-height: 32px !important;
  color: #1f2328 !important;
  font-size: 14px !important;
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
  margin-top: 8px !important;
  margin-bottom: 0 !important;
}

.custom-checkbox {
  display: flex;
  align-items: flex-start;
}

.signup-form :deep(.el-checkbox__label) {
  display: inline-flex;
  align-items: center;
  font-size: 12px !important;
  color: #656d76 !important;
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

.text-link :deep(.el-link__inner) {
  color: #0969da !important;
  font-size: 12px !important;
}

.text-link:hover :deep(.el-link__inner) {
  text-decoration: underline !important;
}

/* Button */
.create-account-btn {
  width: 100%;
  padding: 6px 16px !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  line-height: 20px !important;
  height: 32px !important;
  --el-button-bg-color: #2da44e !important;
  --el-button-border-color: rgba(27, 31, 36, 0.15) !important;
  --el-button-text-color: #ffffff !important;
  --el-button-hover-bg-color: #2c974b !important;
  --el-button-hover-border-color: rgba(27, 31, 36, 0.15) !important;
  background-color: #2da44e !important;
  border-color: rgba(27, 31, 36, 0.15) !important;
  border-radius: 6px !important;
  cursor: pointer;
  transition: background-color 0.2s !important;
}

.create-account-btn:hover {
  background-color: #2c974b !important;
  border-color: rgba(27, 31, 36, 0.15) !important;
}

/* Terms Notice */
.terms-notice {
  font-size: 12px;
  color: #656d76;
  text-align: center;
  margin: 16px 0 0 0;
  line-height: 1.5;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0;
}

.terms-notice :deep(.el-link) {
  display: inline;
}

.terms-notice :deep(.el-link__inner) {
  color: #0969da !important;
  font-size: 12px !important;
}

.terms-notice :deep(.el-link:hover .el-link__inner) {
  text-decoration: underline !important;
}

/* Sign In Link */
.signin-link {
  margin-top: 16px;
  padding: 8px 16px;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  text-align: center;
  font-size: 14px;
  color: #1f2328;
  background-color: #f6f8fa;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
}

.signin-link :deep(.el-link__inner) {
  color: #0969da !important;
  font-size: 14px !important;
}

.signin-link :deep(.el-link:hover .el-link__inner) {
  text-decoration: underline !important;
}
</style>
