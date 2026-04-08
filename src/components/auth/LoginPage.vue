<template>
  <div
    class="login-container"
    :class="{
      'login-container--web-bg': !isDesktopEmbedMode,
      'login-container--desktop': isDesktopEmbedMode
    }"
  >
    <div
      class="login-main"
      :class="{
        'login-main--web-frame': !isDesktopEmbedMode,
        'login-main--desktop': isDesktopEmbedMode
      }"
    >
      <!-- Logo 与标题同一行，左右两端对齐 -->
      <div class="page-heading">
        <a href="#" class="app-logo">
          <img src="/qjcam-logo.png" alt="QJCAM" class="app-logo-img" />
        </a>
        <h1 class="title">登录</h1>
      </div>

      <!-- Login Form -->
      <div class="login-box">
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          :validate-on-rule-change="false"
          @submit.prevent="submitLogin"
          class="login-form"
        >
          <!-- 密码模式：用户名或邮箱 -->
          <el-form-item v-if="!isCodeMode" prop="username">
            <template #label>
              <div class="label-row">
                <label class="custom-label">用户名或邮箱地址</label>
                <div class="label-links">
                  <el-link
                    type="primary"
                    underline="never"
                    class="forgot-link"
                    @click="switchToCodeMode"
                  >
                    使用验证码登录
                  </el-link>
                </div>
              </div>
            </template>
            <el-input
              v-model="form.username"
              placeholder="请输入用户名或邮箱"
              autocomplete="username"
            />
          </el-form-item>

          <!-- 验证码模式：邮箱 -->
          <el-form-item v-else prop="email">
            <template #label>
              <div class="label-row">
                <label class="custom-label">邮箱地址</label>
                <div class="label-links">
                  <el-link
                    type="primary"
                    underline="never"
                    class="forgot-link"
                    @click="switchToPasswordMode"
                  >
                    使用密码登录
                  </el-link>
                </div>
              </div>
            </template>
            <el-input
              v-model="form.email"
              placeholder="请输入邮箱"
              type="email"
              autocomplete="email"
            />
          </el-form-item>

          <el-form-item v-if="!isCodeMode" prop="password">
            <template #label>
              <div class="label-row">
                <label class="custom-label">密码</label>
                <div class="label-links">
                  <el-link type="primary" underline="never" class="forgot-link" @click.stop.prevent="goToReset">
                    忘记密码？
                  </el-link>
                </div>
              </div>
            </template>
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              autocomplete="current-password"
              show-password
            />
          </el-form-item>

          <el-form-item v-else prop="code">
            <template #label>
              <label class="custom-label">验证码</label>
            </template>
            <VerifyCodeBox
              account-label="邮箱"
              :account="form.email"
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

          <!-- 同意协议（必选，勾选后才可登录） -->
          <el-form-item class="terms-item">
            <el-checkbox v-model="form.agreeTerms" class="custom-checkbox">
              <span class="checkbox-text">
                我已阅读并同意
                <el-link type="primary" underline="never" href="#" @click.prevent>用户协议</el-link>
                和
                <el-link type="primary" underline="never" href="#" @click.prevent>隐私政策</el-link>
              </span>
            </el-checkbox>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              native-type="submit"
              class="sign-in-btn"
              :disabled="!form.agreeTerms"
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

<script lang="ts">
import {
  isDesktopEmbed,
  notifyDesktopLoginSuccess,
  cloneUserForDesktopBridge,
} from '@/utils/desktopBridge'
import { pushWithDesktopQuery } from '@/utils/desktopNav'
import VerifyCodeBox from '@/components/common/VerifyCodeBox.vue'
import { requestButtonThrottle } from '@/utils/requestThrottle'
import type { FormInstance, FormRules } from 'element-plus'

export default {
  name: 'LoginPage',
  components: {
    VerifyCodeBox,
  },
  data() {
    return {
      form: {
        username: '',
        email: '',
        password: '',
        code: '',
        /** 是否已阅读并同意用户协议与隐私政策（登录前必选） */
        agreeTerms: false,
      },
      isCodeMode: false,
      countdown: 0,
    }
  },
  computed: {
    /** Qt 内嵌或 ?client=desktop 时为 true；Web 独立访问为 false */
    isDesktopEmbedMode() {
      return isDesktopEmbed(this.$route.query)
    },
    rules(): FormRules {
      const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return {
        username: [
          {
            // 密码登录模式下必填；验证码模式下跳过。
            validator: (_rule, value: string, callback) => {
              if (this.isCodeMode) return callback()
              if (String(value ?? '').trim()) return callback()
              callback(new Error('请输入用户名或邮箱'))
            },
            trigger: 'blur'
          }
        ],
        password: [
          {
            // 密码登录模式下必填；验证码模式下跳过。
            validator: (_rule, value: string, callback) => {
              if (this.isCodeMode) return callback()
              if (value) return callback()
              callback(new Error('请输入密码'))
            },
            trigger: 'blur'
          }
        ],
        email: [
          {
            // 验证码登录模式下必填且需为邮箱；密码登录模式下跳过。
            validator: (_rule, value: string, callback) => {
              if (!this.isCodeMode) return callback()
              const s = String(value ?? '').trim()
              if (!s) return callback(new Error('请输入邮箱'))
              if (!emailReg.test(s)) return callback(new Error('请输入正确邮箱'))
              callback()
            },
            trigger: 'blur'
          }
        ],
        code: [
          {
            // 验证码登录模式下必填；密码登录模式下跳过。
            validator: (_rule, value: string, callback) => {
              if (!this.isCodeMode) return callback()
              if (String(value ?? '').trim()) return callback()
              callback(new Error('请输入验证码'))
            },
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    this.sendCode = requestButtonThrottle(this.sendCodeCore.bind(this))
    this.submitLogin = requestButtonThrottle(this.submitLoginCore.bind(this))
  },
  methods: {
    getFormRef(): FormInstance | null {
      const ref = this.$refs.formRef
      return (ref ?? null) as FormInstance | null
    },
    switchToCodeMode() {
      this.isCodeMode = true
      // 切换模式后清理旧错误提示，避免错误遗留到另一种模式。
      this.getFormRef()?.clearValidate()
    },
    switchToPasswordMode() {
      this.isCodeMode = false
      this.getFormRef()?.clearValidate()
    },
    sendCode(): void {
      /* created 中替换为节流包装 */
    },
    async sendCodeCore() {
      if (this.countdown > 0) return
      const formRef = this.getFormRef()
      if (formRef) {
        const ok = await formRef
          .validateField('email')
          .then(() => true)
          .catch(() => false)
        if (!ok) return
      }
      try {
        await this.$userStore.sendLoginCode(this.form.email.trim())
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
    submitLogin(): void {
      /* created 中替换为节流包装 */
    },
    async submitLoginCore() {
      const formRef = this.getFormRef()
      if (formRef) {
        const ok = await formRef
          .validate()
          .then(() => true)
          .catch(() => false)
        if (!ok) return
      }
      try {
        if (!this.isCodeMode) {
          await this.$userStore.loginByPassword(this.form.username.trim(), this.form.password)
        } else {
          await this.$userStore.loginByCode(this.form.email.trim(), this.form.code.trim())
        }
        await this.$userStore.fetchCurrentUser()
        ElMessage.success('登录成功')
        if (isDesktopEmbed(this.$route.query)) {
          // 桌面嵌入模式下由 Qt 接管后续流程，这里只回传登录信息，不做前端路由跳转。
          const u = this.$userStore.user
          if (!u) {
            ElMessage.error('未能获取用户信息')
            return
          }
          const handedToQt = notifyDesktopLoginSuccess({
            token: this.$userStore.token,
            user: cloneUserForDesktopBridge(u)
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
      pushWithDesktopQuery(this.$router, this.$route.query, '/register')
    },
    goToReset() {
      pushWithDesktopQuery(this.$router, this.$route.query, '/reset-password')
    },
  }
}
</script>

<style scoped>
.login-container {
  box-sizing: border-box;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  /* 与注册/重置页一致，适配 Qt 固定窗口 */
  padding: 12px 16px 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
  font-size: var(--auth-fs-root);
  overflow: hidden;
}

/* Qt 内嵌：垂直居中（与原生窗口/固定尺寸的视觉更一致） */
.login-container.login-container--desktop {
  justify-content: center;
}

/* Web 独立访问：全屏背景图；Qt 内嵌不加此类，保持白底。
   Vite public 资源映射到站点根路径，须用 /background.png，勿写 /public/... */
.login-container.login-container--web-bg {
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
  .login-container.login-container--web-bg {
    grid-template-columns: 1fr;
  }
}

.login-main {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1 1 auto;
}

/* WEB：外框随内容高度（不撑满视口），白底 + 阴影过渡；Qt 不加此类 */
.login-main.login-main--web-frame {
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
  .login-main.login-main--web-frame {
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

/* 桌面端：标题行与表单同宽，避免左右撑满容器造成"超出边界"的观感 */
.login-main.login-main--desktop .page-heading {
  max-width: 340px;
}

.app-logo {
  color: var(--auth-text-title);
  text-decoration: none;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

/* PNG 保持高度、宽度随比例，避免拉伸 */
.app-logo-img {
  display: block;
  height: 32px;
  width: auto;
  max-width: 120px;
  object-fit: contain;
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

.login-box {
  width: 100%;
  max-width: 340px;
  background-color: transparent;
  border: none;
  border-radius: 6px;
  /* 仅登录页：表单区内边距略大，与注册/重置区分 */
  /* 内部无边界表单：padding 置 0，保证每行左右对齐 */
  padding: 0;
  margin-top: 16px;
}

/* 表单：与注册页一致，用 gap 控制纵向间距 */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 同意协议：垂直居中显示（checkbox 与文字对齐更自然） */
.terms-item :deep(.el-form-item__content) {
  display: flex;
  align-items: center;
}

.terms-item .custom-checkbox {
  align-items: center;
}

/* 覆盖 Element Plus Form 样式 */
.login-box :deep(.el-form-item) {
  margin-bottom: 10px;
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
  font-size: var(--auth-fs-label) !important;
  font-weight: 400 !important;
  color: var(--auth-text) !important;
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
  /* 视觉微调：右侧链接组向左挪 4px */
  margin-right: 8px;
}

/* 覆盖 Element Plus Link 样式 */
.forgot-link {
  font-size: var(--auth-fs-small) !important;
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
  --el-input-text-color: var(--auth-text);
  /* 与变量统一 placeholder 色，避免额外 ::placeholder 规则 */
  --el-input-placeholder-color: #6e7781;
  --el-input-hover-border: #d0d7de;
  --el-input-focus-border: #0969da;
}

.login-box :deep(.el-input__wrapper) {
  width: 100%;
  padding: 0 12px !important;
  height: 32px !important;
  /* 与历史样式一致：外层 14px，内层仍由 .el-input__inner 的 --auth-fs-input 控制 */
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
  line-height: 19px !important;
  color: var(--auth-text) !important;
  font-size: var(--auth-fs-input) !important;
}

/* 用户协议勾选：仿照注册页 */
.custom-checkbox {
  display: flex;
  align-items: flex-start;
}

.login-box :deep(.custom-checkbox .el-checkbox__label) {
  display: inline-flex;
  align-items: center;
  font-size: var(--auth-fs-small) !important;
  color: var(--auth-text-muted) !important;
  line-height: 1.5 !important;
  padding-left: 8px !important;
}

.login-box :deep(.custom-checkbox .el-checkbox__inner) {
  width: 16px !important;
  height: 16px !important;
  border: 1px solid #d0d7de !important;
  border-radius: 3px !important;
  background-color: #ffffff !important;
}

.login-box :deep(.custom-checkbox .el-checkbox__inner::after) {
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

.login-box :deep(.custom-checkbox.is-checked .el-checkbox__inner) {
  background-color: #0969da !important;
  border-color: #0969da !important;
}

/* 登录页文本与链接：对齐注册页 checkbox-text */
.checkbox-text {
  font-size: var(--auth-fs-small) !important;
  color: var(--auth-text-muted) !important;
  line-height: 1.5 !important;
}

.checkbox-text :deep(.el-link__inner) {
  color: #0969da !important;
  font-size: var(--auth-fs-small) !important;
}

.checkbox-text :deep(.el-link:hover .el-link__inner) {
  text-decoration: underline !important;
}

.sign-in-btn {
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

.sign-in-btn:hover:not(:disabled) {
  filter: brightness(1.05);
}

.sign-in-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  filter: none;
}

.create-account-box {
  width: 100%;
  max-width: 340px;
  /* 登录按钮与"还没有账户"区间距：避免视觉过挤 */
  margin-top: 20px;
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

.create-account-box :deep(.el-link__inner) {
  color: #0969da !important;
  font-size: 14px !important;
}

.create-account-box :deep(.el-link:hover .el-link__inner) {
  text-decoration: underline !important;
}
</style>
