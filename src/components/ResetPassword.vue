<script lang="ts">
export default {
  name: 'ResetPassword',
  data() {
    return {
      step: 1 as 1 | 2,
      email: '',
      code: '',
      password: '',
      confirmPassword: '',
      countdown: 0
    }
  },
  methods: {
    sendCode() {
      if (!this.email) {
        alert('请先输入邮箱地址')
        return
      }
      // TODO: 实现发送验证码逻辑
      console.log('发送验证码到:', this.email)
      this.countdown = 60
      const timer = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    },
    nextStep() {
      // TODO: 验证验证码是否正确
      this.step = 2
    },
    prevStep() {
      this.step = 1
    },
    goToLogin() {
      this.$router.push('/login')
    }
  }
}
</script>

<template>
  <div class="reset-container">
    <div class="reset-main">
      <!-- Header Logo -->
      <div class="header">
        <a href="#" class="qjcam-logo">
          <img src="/logo.ico" height="32" width="32" alt="Logo" />
        </a>
      </div>

      <!-- Reset Form -->
      <div class="reset-content">
        <h1 class="title">重置密码</h1>

        <!-- Step 1: Email and Code -->
        <el-form v-if="step === 1" @submit.prevent class="reset-form">
          <!-- Email -->
          <el-form-item class="form-item-custom">
            <template #label>
              <label class="custom-label">输入您的邮箱</label>
            </template>
            <el-input
              v-model="email"
              type="email"
              placeholder="请输入邮箱"
              autocomplete="email"
              class="custom-input"
            />
          </el-form-item>

          <!-- Verification Code -->
          <el-form-item class="form-item-custom">
            <template #label>
              <label class="custom-label">邮箱验证码</label>
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

          <!-- Next Step Button -->
          <el-form-item class="form-item-custom submit-item">
            <el-button type="primary" class="next-btn" @click="nextStep">
              下一步
            </el-button>
          </el-form-item>
        </el-form>

        <!-- Step 2: Password -->
        <el-form v-else class="reset-form">
          <!-- Password -->
          <el-form-item class="form-item-custom">
            <template #label>
              <label class="custom-label">输入新密码</label>
            </template>
            <div class="password-input-wrapper">
              <el-input
                v-model="password"
                type="password"
                placeholder="密码"
                autocomplete="new-password"
                show-password
                class="custom-input password-input"
              />
              <span class="password-hint-inline">8-20位字母或数字</span>
            </div>
          </el-form-item>

          <!-- Confirm Password -->
          <el-form-item class="form-item-custom">
            <template #label>
              <label class="custom-label">确认新密码</label>
            </template>
            <el-input
              v-model="confirmPassword"
              type="password"
              placeholder="确认密码"
              autocomplete="new-password"
              show-password
              class="custom-input"
            />
          </el-form-item>

          <!-- Buttons -->
          <el-form-item class="form-item-custom submit-item button-group">
            <el-button class="prev-btn" @click="prevStep">
              上一步
            </el-button>
            <el-button type="primary" native-type="submit" class="reset-btn">
              重置密码
            </el-button>
          </el-form-item>
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
.reset-container {
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

.reset-main {
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
.reset-content {
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
.reset-form {
  border-radius: 6px;
}

.form-item-custom {
  margin-bottom: 10px !important;
}

.submit-item {
  margin-top: 16px !important;
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
}

.reset-form :deep(.el-form-item__content) {
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
.reset-form :deep(.el-input) {
  --el-input-border: #d0d7de;
  --el-input-border-color: #d0d7de;
  --el-input-bg-color: #ffffff;
  --el-input-text-color: #1f2328;
  --el-input-placeholder-color: #6e7781;
  --el-input-hover-border: #d0d7de;
  --el-input-focus-border: #0969da;
}

.reset-form :deep(.el-input__wrapper) {
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

.reset-form :deep(.el-input__wrapper:hover) {
  border-color: #d0d7de !important;
  box-shadow: none !important;
}

.reset-form :deep(.el-input__wrapper.is-focus) {
  border-color: #0969da !important;
  box-shadow: inset 0 0 0 1px #0969da !important;
}

.reset-form :deep(.el-input__inner) {
  height: 32px !important;
  line-height: 32px !important;
  color: #1f2328 !important;
  font-size: 14px !important;
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

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.password-input {
  width: 100%;
}

.password-input :deep(.el-input__wrapper) {
  padding-right: 140px !important;
}

.password-hint-inline {
  position: absolute;
  right: 36px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #8b949e;
  pointer-events: none;
  white-space: nowrap;
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

/* Button */
.next-btn {
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

.next-btn:hover {
  background-color: #2c974b !important;
  border-color: rgba(27, 31, 36, 0.15) !important;
}

.button-group {
  display: flex;
  gap: 12px;
}

.prev-btn {
  flex: 1;
  padding: 6px 16px !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  line-height: 20px !important;
  height: 32px !important;
  background-color: #f6f8fa !important;
  border-color: #d0d7de !important;
  color: #1f2328 !important;
  border-radius: 6px !important;
  cursor: pointer;
  transition: background-color 0.2s !important;
}

.prev-btn:hover {
  background-color: #f3f4f6 !important;
  border-color: #d0d7de !important;
}

.reset-btn {
  flex: 1;
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

.reset-btn:hover {
  background-color: #2c974b !important;
  border-color: rgba(27, 31, 36, 0.15) !important;
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
