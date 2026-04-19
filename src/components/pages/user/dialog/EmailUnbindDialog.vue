<template>
  <AppDialog
    class="email-unbind-dialog"
    :model-value="modelValue"
    title="解绑邮箱"
    width="480px"
    append-to-body
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    destroy-on-close
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <p class="security-dialog-desc">
      解绑需验证当前邮箱。解绑后可重新绑定其它邮箱。
    </p>
    <div class="security-dialog-panel">
      <VerifyCodeBox
        account-label="当前邮箱"
        :account="displayEmail"
        account-readonly
        :code="code"
        :countdown="countdown"
        @update:code="code = $event"
        @send-code="sendUnbindCode"
      />
    </div>
    <template #footer>
      <el-button @click="close">
        取消
      </el-button>
      <el-button type="primary" :loading="submitting" @click="onConfirm">
        确定
      </el-button>
    </template>
  </AppDialog>
</template>

<script lang="ts">
import AppDialog from '@/components/common/AppDialog.vue'
import VerifyCodeBox from '@/components/common/VerifyCodeBox.vue'
import { sendCodeApi } from '@/api/auth'
import { unbindCurrentUserEmailApi } from '@/api/user'
import { requestButtonThrottle } from '@/utils/requestThrottle'

function maskEmail(email: string): string {
  const s = String(email ?? '').trim()
  const at = s.indexOf('@')
  if (at <= 0) return '***'
  const local = s.slice(0, at)
  const domain = s.slice(at + 1)
  if (!domain) return '***'
  const visible = local.slice(0, 3)
  return `${visible || '*'}***@${domain}`
}

export default {
  name: 'EmailUnbindDialog',
  components: { AppDialog, VerifyCodeBox },
  props: {
    modelValue: { type: Boolean, required: true },
    currentEmail: { type: String, required: true },
  },
  emits: ['update:modelValue', 'success'],
  data() {
    return {
      code: '',
      countdown: 0,
      countdownTimer: null as ReturnType<typeof setInterval> | null,
      submitting: false,
    }
  },
  computed: {
    displayEmail(): string {
      return maskEmail(this.currentEmail)
    },
  },
  watch: {
    modelValue(v: boolean) {
      if (v) this.resetForm()
    },
  },
  created() {
    this.sendUnbindCode = requestButtonThrottle(this.sendUnbindCodeCore.bind(this))
  },
  beforeUnmount() {
    this.stopCountdown()
  },
  methods: {
    sendUnbindCode(): void {
      /* created 中替换为节流包装 */
    },
    resetForm() {
      this.stopCountdown()
      this.code = ''
      this.submitting = false
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
        if (this.countdown <= 0) this.stopCountdown()
      }, 1000)
    },
    close() {
      this.$emit('update:modelValue', false)
    },
    async sendUnbindCodeCore() {
      const email = String(this.currentEmail ?? '').trim()
      if (!email) {
        ElMessage.error('未获取到已绑定邮箱')
        return
      }
      if (this.countdown > 0) return
      try {
        await sendCodeApi({ account: email, scene: 'UNBIND_EMAIL' })
        ElMessage.success('验证码已发送')
        this.startCountdown(60)
      } catch {
        // 拦截器已提示
      }
    },
    async onConfirm() {
      const code = this.code.trim()
      if (!code) {
        ElMessage.error('请输入验证码')
        return
      }
      if (this.submitting) return
      this.submitting = true
      try {
        const result = await unbindCurrentUserEmailApi({ code })
        const msg = typeof result?.msg === 'string' ? result.msg : ''
        ElMessage.success(msg || '解绑邮箱成功')
        this.close()
        await this.$userStore.fetchCurrentUser()
        this.$emit('success')
      } catch {
        // 拦截器已提示
      } finally {
        this.submitting = false
      }
    },
  },
}
</script>

<style scoped>
.security-dialog-panel {
  padding: 0;
  margin: 0;
  background: transparent;
  border: none;
  border-radius: 0;
}

.security-dialog-desc {
  margin: 0 0 16px;
  font-size: 13px;
  line-height: 1.55;
  color: #64748b;
}
</style>

