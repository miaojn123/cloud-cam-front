<script lang="ts">
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores'
import {
  isDesktopEmbed,
  notifyDesktopLoginSuccess,
  preserveDesktopClientQuery
} from '@/utils/desktopBridge'

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
      /** 用户名失焦或提交后用于显示非空校验 */
      usernameTouched: false,
      passwordTouched: false,
      emailTouched: false,
      /** 是否已阅读并同意用户协议与隐私政策（登录前必选） */
      agreeTerms: false
    }
  },
  computed: {
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
        ElMessage.warning('请先输入邮箱')
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
      if (!this.agreeTerms) {
        ElMessage.warning('请阅读并勾选同意用户协议与隐私政策')
        return
      }
      const userStore = useUserStore()
      try {
        if (!this.isCodeMode) {
          // 非空校验：错误在输入框下方展示，不使用 Message
          this.usernameTouched = true
          this.passwordTouched = true
          if (!this.username.trim() || !this.password) {
            return
          }
          await userStore.loginByPassword(this.username.trim(), this.password)
        } else {
          if (!this.email || !this.code) {
            ElMessage.warning('请输入账号和验证码')
            return
          }
          await userStore.loginByCode(this.email, this.code)
        }
        await userStore.fetchCurrentUser()
        ElMessage.success('登录成功')
        if (isDesktopEmbed(this.$route.query)) {
          // 桌面嵌入模式下由 Qt 接管后续流程，这里只回传登录信息，不做前端路由跳转。
          const handedToQt = notifyDesktopLoginSuccess({
            token: userStore.token,
            user: {
              uuid: userStore.currentUser?.uuid || '',
              userName: userStore.currentUser?.userName || '',
              nickName: userStore.currentUser?.nickName || '',
              email: userStore.currentUser?.email || '',
              phone: userStore.currentUser?.phone || '',
              sex: userStore.currentUser?.sex ?? 0,
              avatar: userStore.currentUser?.avatar || '',
              role: userStore.currentUser?.role ?? 0
            }
          })
          if (handedToQt) return
        }
        this.$router.push('/files')
      } catch (error) {
        const message = error instanceof Error ? error.message : '登录失败'
        ElMessage.error(message)
      }
    },
    goToRegister() {
      const q = preserveDesktopClientQuery(this.$route.query)
      this.$router.push(Object.keys(q).length ? { path: '/register', query: q } : '/register')
    },
    goToReset() {
      const q = preserveDesktopClientQuery(this.$route.query)
      this.$router.push(Object.keys(q).length ? { path: '/reset-password', query: q } : '/reset-password')
    },
    onUsernameBlur() {
      this.usernameTouched = true
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
      <!-- 图标与标题同一行居中 -->
      <div class="page-heading">
        <a href="#" class="app-logo">
          <img src="/logo.ico" height="32" width="32" alt="Logo" />
        </a>
        <h1 class="title">登录 QJCAM</h1>
      </div>

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
              @blur="onUsernameBlur"
            />
            <div
              v-if="usernameTouched && !username.trim()"
              class="password-hint password-hint-error"
            >
              请输入用户名或邮箱
            </div>
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
            <!-- 登录仅校验非空；新密码格式规则仅在注册/重置页校验 -->
            <div v-if="passwordTouched && !password" class="password-hint password-hint-error">
              请输入密码
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

          <!-- 同意协议（必选，勾选后才可登录） -->
          <el-form-item class="form-item-no-margin terms-checkbox-row">
            <el-checkbox v-model="agreeTerms" class="terms-checkbox">
              <span class="terms-checkbox-text">
                我已阅读并同意
                <el-link type="primary" underline="never" href="#" @click.prevent>用户协议</el-link>
                和
                <el-link type="primary" underline="never" href="#" @click.prevent>隐私政策</el-link>
              </span>
            </el-checkbox>
          </el-form-item>

          <el-form-item class="form-item-no-margin submit-item">
            <el-button
              type="primary"
              native-type="submit"
              class="sign-in-btn"
              :disabled="!agreeTerms"
            >
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
  box-sizing: border-box;
  min-height: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  /* 与注册/重置页一致，适配 Qt 固定窗口 */
  padding: 12px 16px 16px;
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

.page-heading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 12px;
  width: 100%;
}

.app-logo {
  color: #1f2328;
  text-decoration: none;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.page-heading .title {
  font-size: 24px;
  font-weight: 400;
  color: #1f2328;
  margin: 0;
  line-height: 1.2;
}

.login-box {
  width: 100%;
  max-width: 340px;
  background-color: #ffffff;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  /* 仅登录页：表单区内边距略大，与注册/重置区分 */
  padding: 18px 18px 20px;
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
  margin-top: 20px !important;
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

/* 用户协议勾选（与注册页风格一致） */
.terms-checkbox-row {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}

.terms-checkbox {
  display: flex;
  align-items: flex-start;
}

.login-box :deep(.terms-checkbox .el-checkbox__label) {
  display: inline-flex;
  align-items: center;
  font-size: 12px !important;
  color: #656d76 !important;
  line-height: 1.5 !important;
  padding-left: 8px !important;
}

.login-box :deep(.terms-checkbox .el-checkbox__inner) {
  width: 16px !important;
  height: 16px !important;
  border: 1px solid #d0d7de !important;
  border-radius: 3px !important;
  background-color: #ffffff !important;
}

.login-box :deep(.terms-checkbox .el-checkbox__inner::after) {
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

.login-box :deep(.terms-checkbox.is-checked .el-checkbox__inner) {
  background-color: #0969da !important;
  border-color: #0969da !important;
}

.login-box :deep(.terms-checkbox.el-checkbox.is-checked .el-checkbox__label) {
  color: #656d76 !important;
}

.terms-checkbox-text {
  font-size: 12px !important;
  color: #656d76 !important;
  line-height: 1.5 !important;
}

.terms-checkbox-text :deep(.el-link__inner) {
  color: #0969da !important;
  font-size: 12px !important;
}

.terms-checkbox-text :deep(.el-link:hover .el-link__inner) {
  text-decoration: underline !important;
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

.sign-in-btn:hover:not(:disabled) {
  background-color: #2c974b !important;
  border-color: rgba(27, 31, 36, 0.15) !important;
}

.sign-in-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.create-account-box {
  width: 100%;
  max-width: 340px;
  margin-top: 12px;
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
