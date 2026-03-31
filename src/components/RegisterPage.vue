<script lang="ts">
import { isDesktopEmbed } from '@/utils/desktopBridge'
import { pushWithDesktopQuery } from '@/utils/desktopNav'
import { isRegisterPasswordValid } from '@/utils/passwordPolicy'
import type { FormInstance, FormRules } from 'element-plus'

export default {
  name: 'RegisterPage',
  data() {
    return {
      form: {
        email: '',
        password: '',
        username: '',
        emailCode: '',
        /** 是否同意服务条款与隐私政策（必选） */
        agreeTerms: false
      },
      emailCountdown: 0,
    }
  },
  computed: {
    /** Qt 内嵌或 ?client=desktop 时为 true；Web 独立访问为 false（与登录页一致） */
    isDesktopEmbedMode() {
      return isDesktopEmbed(this.$route.query)
    },
    rules(): FormRules {
      const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { pattern: emailReg, message: '请输入正确邮箱', trigger: 'blur' }
        ],
        emailCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            // 中文注释：注册密码规则（与后端一致），避免仅靠提示文案导致提交时才报错。
            validator: (_rule, value: string, callback) => {
              if (!value) return callback()
              if (!isRegisterPasswordValid(value)) {
                callback(new Error('密码需为 8-20 位，且至少包含一个数字和一个字母'))
                return
              }
              callback()
            },
            trigger: 'blur'
          }
        ],
        username: [
          {
            // 中文注释：用户名可选；若填写则必须 6-20，英文开头，仅字母数字下划线。
            validator: (_rule, value: string, callback) => {
              const v = String(value ?? '').trim()
              if (!v) return callback()
              const ok = /^[A-Za-z][A-Za-z0-9_]*$/.test(v) && v.length >= 6 && v.length <= 20
              if (!ok) {
                callback(new Error('用户名需 6-20 位，英文开头，仅字母数字下划线'))
                return
              }
              callback()
            },
            trigger: 'blur'
          }
        ],
        agreeTerms: [
          {
            // 中文注释：勾选条款是强制项，错误提示走表单系统（而不是只弹 Message）。
            validator: (_rule, value: boolean, callback) => {
              if (value) return callback()
              callback(new Error('请勾选同意服务条款与隐私政策'))
            },
            trigger: 'change'
          }
        ]
      }
    }
  },
  methods: {
    getFormRef(): FormInstance | null {
      const ref = this.$refs.formRef
      return (ref ?? null) as FormInstance | null
    },
    async sendEmailCode() {
      const formRef = this.getFormRef()
      if (formRef) {
        const ok = await formRef
          .validateField('email')
          .then(() => true)
          .catch(() => false)
        if (!ok) return
      }
      try {
        await this.$userStore.sendRegisterCode(this.form.email.trim())
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
      const formRef = this.getFormRef()
      if (formRef) {
        const ok = await formRef
          .validate()
          .then(() => true)
          .catch(() => false)
        if (!ok) return
      }
      try {
        // 用户名可选：为空则交由后端使用默认用户名
        const optionalUsername = this.form.username.trim()
        await this.$userStore.registerByCode(
          this.form.email.trim(),
          this.form.emailCode.trim(),
          this.form.password,
          optionalUsername || ''
        )
        ElMessage.success('注册成功，请登录')
        pushWithDesktopQuery(this.$router, this.$route.query, '/login')
      } catch {
        ElMessage.error('注册失败')
      }
    },
    goToLogin() {
      pushWithDesktopQuery(this.$router, this.$route.query, '/login')
    }
  }
}
</script>

<template>
  <div
    class="signup-container"
    :class="{
      'signup-container--web-bg': !isDesktopEmbedMode
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
          <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            @submit.prevent="submitRegister"
            class="signup-form"
          >
            <!-- Email -->
            <el-form-item prop="email">
              <template #label>
                <label class="custom-label">邮箱地址</label>
              </template>
              <el-input
                v-model="form.email"
                type="email"
                placeholder="请输入邮箱"
                autocomplete="email"
              />
            </el-form-item>

            <!-- Email Verification Code -->
            <el-form-item prop="emailCode">
              <template #label>
                <label class="custom-label">邮箱验证码</label>
              </template>
              <div class="code-input-wrapper">
                <el-input
                  v-model="form.emailCode"
                  placeholder="请输入验证码"
                  autocomplete="one-time-code"
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

            <!-- Username -->
            <el-form-item prop="username">
              <template #label>
                <label class="custom-label">用户名（可选）</label>
              </template>
              <el-input
                v-model="form.username"
                type="text"
                placeholder="不填将使用默认用户名"
                autocomplete="username"
              />
            </el-form-item>

            <!-- Password -->
            <el-form-item prop="password">
              <template #label>
                <label class="custom-label">输入密码</label>
              </template>
              <el-input
                v-model="form.password"
                type="password"
                placeholder="8-20位，至少包含字母和数字"
                autocomplete="new-password"
                show-password
              />
            </el-form-item>

            <!-- 同意条款（必选，勾选后才可点击创建账户） -->
            <el-form-item prop="agreeTerms">
              <el-checkbox v-model="form.agreeTerms" class="custom-checkbox">
                <span class="checkbox-text">
                  创建账户即表示您同意我们的
                  <el-link type="primary" underline="never" href="#" @click.prevent>服务条款</el-link>
                  和
                  <el-link type="primary" underline="never" href="#" @click.prevent>隐私政策</el-link>。
                </span>
              </el-checkbox>
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                native-type="submit"
                class="create-account-btn"
                :disabled="!form.agreeTerms"
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
  /* 紧凑：标题区与表单卡片间距略小于登录页 login-box 的 16px */
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

/* Form：纵向节奏由 gap 统一控制，避免各表单项 margin 与 hint 高度叠加导致不协调 */
.signup-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-radius: 6px;
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
  /* 输入框与底部提示上下排列，避免 flex 子项高度被压成 0 */
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
.signup-form :deep(.el-input) {
  --el-input-border: #d0d7de;
  --el-input-border-color: #d0d7de;
  --el-input-bg-color: #ffffff;
  --el-input-text-color: var(--auth-text);
  /* 与变量统一 placeholder 色，避免额外 ::placeholder 规则 */
  --el-input-placeholder-color: #6e7781;
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

.code-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.code-input-wrapper :deep(.el-input__wrapper) {
  padding-right: 86px !important;
}

/* 覆盖 Element Plus Button 样式 */
.send-code-btn {
  position: absolute;
  right: 7px;
  top: 50%;
  transform: translateY(-50%);
  padding: 2px 8px !important;
  font-size: 11px !important;
  font-weight: 400 !important;
  line-height: 20px !important;
  height: 22px !important;
  min-height: 22px !important;
  --el-button-bg-color: #0969da !important;
  --el-button-border-color: #0969da !important;
  --el-button-text-color: #ffffff !important;
  --el-button-hover-bg-color: #0866c8 !important;
  --el-button-hover-border-color: #0866c8 !important;
  --el-button-disabled-bg-color: #8b949e !important;
  --el-button-disabled-border-color: #8b949e !important;
  --el-button-disabled-text-color: #ffffff !important;
  border-radius: 3px !important;
  cursor: pointer;
  transition: all 0.2s !important;
  white-space: nowrap;
}

.custom-checkbox {
  display: flex;
  align-items: center;
  margin-top: 0;
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
  margin-top: 0;
}

.create-account-btn:hover:not(:disabled) {
  filter: brightness(1.05);
}

.create-account-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  filter: none;
}

/* Sign In Link：主按钮与底部入口之间略留呼吸感（与 gap 体系一致） */
.signin-link {
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

/* 中文注释：说明文案改为 placeholder；错误提示由 Element Plus Form 规则统一渲染。 */
</style>
