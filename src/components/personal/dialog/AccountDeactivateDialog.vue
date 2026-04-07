<template>
  <el-dialog
    class="profile-security-dialog account-deactivate-dialog"
    :model-value="modelValue"
    :title="dialogTitle"
    width="520px"
    append-to-body
    :close-on-click-modal="false"
    destroy-on-close
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div v-if="step === 'warn'" class="deactivate-warn">
      <p class="deactivate-warn__lead">
        删除账号后，全部信息将会被移除，且无法找回。是否确认要删除账号？
      </p>
      <p class="deactivate-warn__hint">
        若确认删除，请在下方输入框中输入「{{ CONFIRM_DELETE_PHRASE }}」。
      </p>
      <el-input
        v-model="confirmPhraseInput"
        class="deactivate-warn__input"
        :placeholder="CONFIRM_DELETE_PHRASE"
        clearable
        autocomplete="off"
      />
    </div>

    <div v-else class="deactivate-verify">
      <p class="deactivate-verify__tip">
        请通过验证码或登录密码完成身份校验，通过后账号将被永久注销。
      </p>
      <div class="security-dialog-panel">
        <el-radio-group v-model="verifyMode" class="deactivate-verify__methods">
          <el-radio v-if="canShowCodeVerify" value="code" class="deactivate-verify__radio">
            验证码验证
          </el-radio>
          <el-radio value="password" class="deactivate-verify__radio">
            密码验证
          </el-radio>
        </el-radio-group>

        <div
          v-if="verifyMode === 'code' && hasEmail && hasPhone"
          class="deactivate-verify__channels"
        >
          <span class="deactivate-verify__channels-label">验证码发送至</span>
          <el-radio-group v-model="codeChannel" class="deactivate-verify__channels-group">
            <el-radio value="email">
              邮箱
            </el-radio>
            <el-radio value="phone">
              手机
            </el-radio>
          </el-radio-group>
        </div>

        <div v-if="verifyMode === 'code'" class="deactivate-verify__box">
          <VerifyCodeBox
            :account-label="verifyAccountLabel"
            :account="displayAccount"
            account-readonly
            :code="code"
            :countdown="countdown"
            @update:code="code = $event"
            @send-code="sendCancelCode"
          />
        </div>
        <div v-else class="deactivate-verify__pwd">
          <div class="deactivate-verify__pwd-label">登录密码</div>
          <el-input
            v-model="password"
            type="password"
            show-password
            placeholder="请输入当前登录密码（8-20 位）"
            autocomplete="current-password"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <template v-if="step === 'warn'">
        <el-button @click="close">
          取消
        </el-button>
        <el-button type="danger" :disabled="!phraseMatches" @click="onConfirmWarn">
          删除账号
        </el-button>
      </template>
      <template v-else>
        <el-button @click="onBackToWarn">
          上一步
        </el-button>
        <el-button
          type="danger"
          :loading="submitting"
          :disabled="!canSubmitVerify"
          @click="onFinalSubmit"
        >
          确认注销
        </el-button>
      </template>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import type { PropType } from 'vue'
import type { Router } from 'vue-router'
import type { CurrentUser } from '@/types/user'
import { cancelCurrentAccountByCodeApi, cancelCurrentAccountByPasswordApi } from '@/api/user'
import { sendCodeApi } from '@/api/auth'
import { requestButtonThrottle } from '@/utils/requestThrottle'
import VerifyCodeBox from '@/components/common/VerifyCodeBox.vue'

type Step = 'warn' | 'verify'
/** 第二步：验证码（邮箱或手机）或密码 */
type VerifyMode = 'code' | 'password'
type CodeChannel = 'email' | 'phone'

// 第一步须与输入框占位完全一致方可继续（防误触）
const CONFIRM_DELETE_PHRASE = '确认删除本账号'

function trimStr(v: string | null | undefined): string {
  return String(v ?? '').trim()
}

function maskEmail(email: string): string {
  const s = trimStr(email)
  const at = s.indexOf('@')
  if (at <= 0) return '***'
  const local = s.slice(0, at)
  const domain = s.slice(at + 1)
  if (!domain) return '***'
  const visible = local.slice(0, 3)
  return `${visible || '*'}***@${domain}`
}

function maskPhone(phone: string): string {
  const s = trimStr(phone)
  if (s.length < 7) return '***'
  return `${s.slice(0, 3)}****${s.slice(-4)}`
}

export default {
  name: 'AccountDeactivateDialog',
  components: {
    VerifyCodeBox,
  },
  props: {
    modelValue: { type: Boolean, required: true },
    user: { type: Object as PropType<CurrentUser | null>, default: null },
    router: { type: Object as PropType<Router>, required: true },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      CONFIRM_DELETE_PHRASE,
      step: 'warn' as Step,
      confirmPhraseInput: '',
      verifyMode: 'password' as VerifyMode,
      codeChannel: 'email' as CodeChannel,
      code: '',
      password: '',
      countdown: 0,
      countdownTimer: null as ReturnType<typeof setInterval> | null,
      submitting: false,
    }
  },
  computed: {
    hasEmail(): boolean {
      return !!trimStr(this.user?.email)
    },
    hasPhone(): boolean {
      return !!trimStr(this.user?.phone)
    },
    boundEmail(): string {
      return trimStr(this.user?.email)
    },
    boundPhone(): string {
      return trimStr(this.user?.phone)
    },
    canShowCodeVerify(): boolean {
      return this.hasEmail || this.hasPhone
    },
    displayAccount(): string {
      if (this.verifyMode !== 'code') return ''
      if (this.codeChannel === 'email') return maskEmail(this.boundEmail)
      return maskPhone(this.boundPhone)
    },
    sendAccount(): string {
      if (this.verifyMode !== 'code') return ''
      return this.codeChannel === 'email' ? this.boundEmail : this.boundPhone
    },
    phraseMatches(): boolean {
      return trimStr(this.confirmPhraseInput) === CONFIRM_DELETE_PHRASE
    },
    dialogTitle(): string {
      return this.step === 'warn' ? '删除账号' : '身份验证'
    },
    canSubmitVerify(): boolean {
      if (this.verifyMode === 'password') {
        const n = this.password.length
        return n >= 8 && n <= 20
      }
      return /^\d{6}$/.test(this.code.trim())
    },
    verifyAccountLabel(): string {
      return this.codeChannel === 'email' ? '邮箱' : '手机号'
    },
  },
  watch: {
    modelValue(v: boolean) {
      if (v) this.resetDialog()
    },
    verifyMode(v: VerifyMode) {
      this.code = ''
      this.password = ''
      this.stopCountdown()
      if (v === 'code') {
        if (!this.hasEmail) this.codeChannel = 'phone'
        else if (!this.hasPhone) this.codeChannel = 'email'
      }
    },
    codeChannel() {
      this.code = ''
      this.stopCountdown()
    },
  },
  created() {
    this.sendCancelCode = requestButtonThrottle(this.sendCancelCodeCore.bind(this))
  },
  beforeUnmount() {
    this.stopCountdown()
  },
  methods: {
    sendCancelCode(): void {
      /* created 中替换为节流包装 */
    },
    resetDialog() {
      this.stopCountdown()
      this.step = 'warn'
      this.confirmPhraseInput = ''
      this.code = ''
      this.password = ''
      this.submitting = false
      this.applyDefaultVerifySelection()
    },
    /** 进入第二步时的默认选项：有可用验证码通道则优先验证码 */
    applyDefaultVerifySelection() {
      if (this.hasEmail || this.hasPhone) {
        this.verifyMode = 'code'
        this.codeChannel = this.hasEmail ? 'email' : 'phone'
      } else {
        this.verifyMode = 'password'
      }
    },
    stopCountdown() {
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer)
        this.countdownTimer = null
      }
      this.countdown = 0
    },
    startCountdown(seconds: number) {
      this.stopCountdown()
      this.countdown = seconds
      this.countdownTimer = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) {
          this.stopCountdown()
        }
      }, 1000)
    },
    close() {
      this.$emit('update:modelValue', false)
    },
    onConfirmWarn() {
      if (!this.phraseMatches) return
      this.applyDefaultVerifySelection()
      this.step = 'verify'
    },
    onBackToWarn() {
      this.step = 'warn'
      this.code = ''
      this.password = ''
      this.stopCountdown()
      this.confirmPhraseInput = ''
    },
    async sendCancelCodeCore() {
      if (this.countdown > 0 || this.verifyMode !== 'code') return
      const acc = this.sendAccount
      if (!acc) return
      try {
        await sendCodeApi(acc, 'ACCOUNT_CANCEL')
        ElMessage.success('验证码已发送')
        this.startCountdown(60)
      } catch {
        // 错误提示由请求拦截器统一处理
      }
    },
    async onFinalSubmit() {
      if (!this.canSubmitVerify || this.submitting) return
      this.submitting = true
      try {
        if (this.verifyMode === 'password') {
          await cancelCurrentAccountByPasswordApi(this.password)
        } else {
          await cancelCurrentAccountByCodeApi(this.sendAccount, this.code.trim())
        }
        ElMessage.success('账号已注销')
        this.$userStore.clearAuth()
        this.close()
        await this.router.replace('/login')
      } catch {
        // 业务错误由拦截器提示
      } finally {
        this.submitting = false
      }
    },
  },
}
</script>

<style src="./security-dialog.css"></style>
<style scoped>
.deactivate-warn__lead {
  margin: 0 0 12px;
  font-size: 15px;
  line-height: 1.55;
  font-weight: 500;
  color: var(--el-color-danger);
}

.deactivate-warn__hint {
  margin: 0 0 16px;
  font-size: 13px;
  line-height: 1.55;
  color: #64748b;
}

.deactivate-warn__input {
  width: 100%;
}

.deactivate-verify__tip {
  margin: 0 0 14px;
  font-size: 14px;
  line-height: 1.5;
  color: #475569;
}

.deactivate-verify__methods {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  margin-bottom: 14px;
}

.deactivate-verify__radio {
  margin-right: 0;
  padding: 6px 0;
  width: 100%;
  box-sizing: border-box;
}

.deactivate-verify__channels {
  margin-bottom: 12px;
}

.deactivate-verify__channels-label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  color: #64748b;
}

.deactivate-verify__channels-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
}

.deactivate-verify__box {
  margin-top: 8px;
}

.deactivate-verify__pwd-label {
  margin-bottom: 8px;
  font-size: 14px;
  color: #4b5563;
}
</style>
