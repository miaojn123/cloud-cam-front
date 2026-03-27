<script lang="ts">
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores'

export default {
  name: 'LoginPage',
  data() {
    return {
      username: '',
      email: '',
      password: '',
      code: '',
      isCodeMode: false,
      countdown: 0,
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
    switchToCodeMode() {
      this.isCodeMode = true
    },
    switchToPasswordMode() {
      this.isCodeMode = false
    },
    async sendCode() {
      if (!this.email) {
        ElMessage.warning('请先输入邮箱或手机号')
        return
      }
      try {
        const userStore = useUserStore()
        await userStore.sendLoginCode(this.email)
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
    async submitLogin() {
      const userStore = useUserStore()
      try {
        if (!this.isCodeMode) {
          if (!this.username || !this.password) {
            ElMessage.warning('请输入账号和密码')
            return
          }
          await userStore.loginByPassword(this.username, this.password)
        } else {
          if (!this.email || !this.code) {
            ElMessage.warning('请输入账号和验证码')
            return
          }
          await userStore.loginByCode(this.email, this.code)
        }
        await userStore.fetchCurrentUser()
        ElMessage.success('登录成功')
        this.$router.push('/files')
      } catch (error) {
        const message = error instanceof Error ? error.message : '登录失败'
        ElMessage.error(message)
      }
    },
    goToRegister() {
      this.$router.push('/register')
    },
    goToReset() {
      this.$router.push('/reset-password')
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
  <div class="login-container">
    <div class="login-main">
      <!-- qjcam Logo -->
      <div class="logo">
        <a href="#" class="qjcam-logo">
          <img src="/logo.ico" height="48" width="48" alt="Logo" />
        </a>
      </div>

      <h1 class="title">登录 QJCAM</h1>

      <!-- Login Form -->
      <div class="login-box">
        <el-form @submit.prevent="submitLogin">
          <!-- 密码模式：用户名或邮箱 -->
          <el-form-item v-if="!isCodeMode" class="form-item-no-margin">
            <template #label>
              <label class="custom-label">用户名或邮箱地址</label>
            </template>
            <el-input
              v-model="username"
              placeholder="请输入用户名或邮箱"
              autocomplete="username"
              class="custom-input"
            />
          </el-form-item>

          <!-- 验证码模式：邮箱 -->
          <el-form-item v-else class="form-item-no-margin">
            <template #label>
              <label class="custom-label">邮箱地址</label>
            </template>
            <el-input
              v-model="email"
              placeholder="请输入邮箱"
              type="email"
              autocomplete="email"
              class="custom-input"
              @blur="onEmailBlur"
            />
            <div v-if="emailTouched && !emailValid" class="password-hint password-hint-error">
              请输入正确邮箱
            </div>
          </el-form-item>

          <el-form-item v-if="!isCodeMode" class="form-item-no-margin">
            <template #label>
              <div class="label-row">
                <label class="custom-label">密码</label>
                <div class="label-links">
                  <el-link
                    type="primary"
                    underline="never"
                    class="forgot-link"
                    @click="switchToCodeMode"
                  >
                    使用验证码登录
                  </el-link>
                  <el-link type="primary" underline="never" class="forgot-link" @click.stop.prevent="goToReset">
                    忘记密码？
                  </el-link>
                </div>
              </div>
            </template>
            <el-input
              v-model="password"
              type="password"
              placeholder="请输入密码"
              autocomplete="current-password"
              show-password
              class="custom-input"
              @blur="onPasswordBlur"
            />
            <div class="password-hint" :class="{ 'password-hint-error': passwordTouched && !passwordValid }">
              8-20位字符，且至少包含一个数字和一个字母
            </div>
          </el-form-item>

          <el-form-item v-else class="form-item-no-margin">
            <template #label>
              <div class="label-row">
                <label class="custom-label">验证码</label>
                <el-link
                  type="primary"
                  underline="never"
                  class="forgot-link"
                  @click="switchToPasswordMode"
                >
                  使用密码登录
                </el-link>
              </div>
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

          <el-form-item class="form-item-no-margin submit-item">
            <el-button type="primary" native-type="submit" class="sign-in-btn">
              登录
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- Create Account -->
      <div class="create-account-box">
        <span>还没有账户？</span>
        <el-link type="primary" underline="never" @click="goToRegister">
          立即注册
        </el-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
  font-size: 14px;
  overflow: hidden;
}

.login-main {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1 1 auto;
}

.logo {
  color: #1f2328;
  margin-bottom: 24px;
}

.qjcam-logo {
  color: #1f2328;
  text-decoration: none;
}

.title {
  font-size: 24px;
  font-weight: 400;
  color: #1f2328;
  margin: 0 0 24px 0;
  text-align: center;
}

.login-box {
  width: 100%;
  max-width: 308px;
  background-color: #ffffff;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  padding: 16px;
  margin-top: 16px;
}

.form-item-no-margin {
  margin-bottom: 16px !important;
}

.form-item-no-margin:last-of-type {
  margin-bottom: 0 !important;
}

.submit-item {
  margin-bottom: 0 !important;
  margin-top: 16px !important;
}

/* 覆盖 Element Plus Form 样式 */
.login-box :deep(.el-form-item) {
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.login-box :deep(.el-form-item__label) {
  padding: 0 !important;
  line-height: 1.5 !important;
  width: 100% !important;
  text-align: left !important;
  justify-content: flex-start !important;
  margin-bottom: 0 !important;
}

.login-box :deep(.el-form-item__content) {
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

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.label-links {
  display: flex;
  gap: 12px;
}

/* 覆盖 Element Plus Link 样式 */
.forgot-link {
  font-size: 12px !important;
}

.forgot-link :deep(.el-link__inner) {
  color: #0969da !important;
}

.forgot-link:hover :deep(.el-link__inner) {
  text-decoration: underline !important;
}

/* 覆盖 Element Plus Input 样式 */
.login-box :deep(.el-input) {
  --el-input-border: #d0d7de;
  --el-input-border-color: #d0d7de;
  --el-input-bg-color: #ffffff;
  --el-input-text-color: #1f2328;
  --el-input-placeholder-color: #6e7781;
  --el-input-hover-border: #d0d7de;
  --el-input-focus-border: #0969da;
}

.login-box :deep(.el-input__wrapper) {
  width: 100%;
  padding: 0 12px !important;
  height: 32px !important;
  font-size: 14px !important;
  background-color: #ffffff !important;
  border: 1px solid #d0d7de !important;
  border-radius: 6px !important;
  box-shadow: none !important;
  display: flex !important;
  align-items: center !important;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s !important;
}

.login-box :deep(.el-input__wrapper:hover) {
  border-color: #d0d7de !important;
  box-shadow: none !important;
}

.login-box :deep(.el-input__wrapper.is-focus) {
  border-color: #0969da !important;
  box-shadow: inset 0 0 0 1px #0969da !important;
}

.login-box :deep(.el-input__inner) {
  height: auto !important;
  line-height: 20px !important;
  color: #1f2328 !important;
  font-size: 14px !important;
}

.login-box :deep(.el-input__inner::placeholder) {
  color: #6e7781 !important;
}

/* 密码输入框的图标 */
.login-box :deep(.el-input__suffix) {
  height: 32px;
}

.login-box :deep(.el-input__suffix-inner) {
  height: 32px;
  display: flex;
  align-items: center;
}

.login-box :deep(.el-input__icon) {
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

.sign-in-btn {
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

.sign-in-btn:hover {
  background-color: #2c974b !important;
  border-color: rgba(27, 31, 36, 0.15) !important;
}

.create-account-box {
  width: 100%;
  max-width: 308px;
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

.create-account-box :deep(.el-link__inner) {
  color: #0969da !important;
  font-size: 14px !important;
}

.create-account-box :deep(.el-link:hover .el-link__inner) {
  text-decoration: underline !important;
}

.footer {
  padding-top: 24px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  font-size: 12px;
}

.footer :deep(.el-link__inner) {
  color: #656d76 !important;
  font-size: 12px !important;
}

.footer :deep(.el-link:hover .el-link__inner) {
  color: #0969da !important;
  text-decoration: underline !important;
}
</style>
