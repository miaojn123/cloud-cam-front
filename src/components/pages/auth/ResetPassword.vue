<template>
  <div
    class="reset-container"
    :class="{
      'reset-container--web-bg': !isDesktopEmbedMode
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
          <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            @submit.prevent="resetPassword"
            class="reset-form"
          >
            <el-form-item prop="account">
              <template #label>
                <label class="custom-label">邮箱或手机号</label>
              </template>
              <el-input
                v-model="form.account"
                type="text"
                placeholder="请输入邮箱或手机号"
                autocomplete="username"
              />
            </el-form-item>

            <el-form-item prop="code">
              <template #label>
                <label class="custom-label">验证码</label>
              </template>
              <VerifyCodeBox
                account-label="邮箱"
                :account="form.account"
                :show-account="false"
                :show-code-label="false"
                :code="form.code"
                code-placeholder="请输入验证码"
                :countdown="countdown"
                send-text="获取验证码"
                :help-link="null"
                @update:code="form.code = $event"
                @send-code="sendCode"
              />
            </el-form-item>

            <el-form-item prop="password">
              <template #label>
                <label class="custom-label">新密码</label>
              </template>
              <el-input
                v-model="form.password"
                type="password"
                placeholder="8-20位，至少包含字母和数字"
                autocomplete="new-password"
                show-password
              />
            </el-form-item>

            <el-form-item prop="confirmPassword">
              <template #label>
                <label class="custom-label">确认新密码</label>
              </template>
              <el-input
                v-model="form.confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                autocomplete="new-password"
                show-password
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" native-type="submit" class="reset-btn">
                重置密码
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- Sign In Link -->
        <div class="signin-link">
          已有账户？ <el-link type="primary" underline="never" @click="goToLogin">前往登录</el-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { isDesktopEmbed } from '@/utils/desktopBridge'
import { pushWithDesktopQuery } from '@/utils/desktopNav'
import { isEmailOrCnPhoneAccount, isResetPasswordValid, Msg } from '@/utils/validators'
import VerifyCodeBox from '@/components/common/VerifyCodeBox.vue'
import { requestButtonThrottle } from '@/utils/requestThrottle'
import type { FormInstance, FormRules } from 'element-plus'

export default {
  name: 'ResetPassword',
  components: {
    VerifyCodeBox,
  },
  data() {
    return {
      form: {
        account: '',
        code: '',
        password: '',
        confirmPassword: '',
      },
      countdown: 0,
    }
  },
  computed: {
    /** Qt 内嵌或 ?client=desktop 时为 true；Web 独立访问为 false（与登录页一致） */
    isDesktopEmbedMode() {
      return isDesktopEmbed(this.$route.query)
    },
    rules(): FormRules {
      return {
        account: [
          { required: true, message: '请输入邮箱或手机号', trigger: 'blur' },
          {
            validator: (_rule, value: string, callback) => {
              const s = String(value ?? '').trim()
              if (!s) return callback()
              if (!isEmailOrCnPhoneAccount(s)) {
                callback(new Error(Msg.emailOrPhone))
                return
              }
              callback()
            },
            trigger: 'blur',
          },
        ],
        code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
        password: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          {
            // 重置密码规则，与注册/后端保持一致。
            validator: (_rule, value: string, callback) => {
              if (!value) return callback()
              if (!isResetPasswordValid(value)) {
                callback(new Error(Msg.passwordRegister))
                return
              }
              callback()
            },
            trigger: 'blur'
          }
        ],
        confirmPassword: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          {
            // 确认密码必须与新密码一致。
            validator: (_rule, value: string, callback) => {
              if (!value) return callback()
              if (value !== this.form.password) {
                callback(new Error('两次输入的密码不一致'))
                return
              }
              callback()
            },
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    this.sendCode = requestButtonThrottle(this.sendCodeCore.bind(this))
    this.resetPassword = requestButtonThrottle(this.resetPasswordCore.bind(this))
  },
  methods: {
    getFormRef(): FormInstance | null {
      const ref = this.$refs.formRef
      return (ref ?? null) as FormInstance | null
    },
    sendCode(): void {
      /* created 中替换为节流包装 */
    },
    async sendCodeCore() {
      if (this.countdown > 0) return
      const formRef = this.getFormRef()
      if (formRef) {
        const ok = await formRef
          .validateField('account')
          .then(() => true)
          .catch(() => false)
        if (!ok) return
      }
      try {
        await this.$userStore.sendResetCode(this.form.account.trim())
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
    resetPassword(): void {
      /* created 中替换为节流包装 */
    },
    async resetPasswordCore() {
      const formRef = this.getFormRef()
      if (formRef) {
        const ok = await formRef
          .validate()
          .then(() => true)
          .catch(() => false)
        if (!ok) return
      }
      try {
        const result = await this.$userStore.resetPassword(
          this.form.account.trim(),
          this.form.code.trim(),
          this.form.password
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
    }
  }
}
</script>

<style scoped>
.reset-container {
  box-sizing: border-box;
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

/* Web：全屏背景 + 表单在右半屏居中（与登录页一致） */
.reset-container.reset-container--web-bg {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  justify-items: center;
  background-image: url('/background.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 12px 16px 16px;
}

@media (max-width: 640px) {
  .reset-container.reset-container--web-bg {
    grid-template-columns: 1fr;
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
  grid-column: 2;
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
    grid-column: auto;
  }
}

.page-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  /* 与注册页一致：标题区更紧凑 */
  margin-bottom: 10px;
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

/* Form：与注册页一致，用 gap 控制纵向节奏 */
.reset-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-radius: 6px;
}

/* 覆盖 Element Plus Form 样式 */
.reset-form :deep(.el-form-item) {
  margin-bottom: 4px;
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
  display: flex;
  flex-direction: column;
  align-items: stretch;
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
  /* 通过变量统一 placeholder 颜色，避免额外 ::placeholder 规则 */
  --el-input-placeholder-color: #6e7781;
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
  margin-top: 10px;
}

.reset-btn:hover {
  filter: brightness(1.05);
}

/* Sign In Link */
.signin-link {
  /* 与注册页一致：按钮与底部入口间距更紧凑 */
  margin-top: 14px;
  padding: 4px 16px;
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
