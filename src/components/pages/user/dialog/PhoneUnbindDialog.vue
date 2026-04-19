<template>
  <AppDialog
    class="phone-unbind-dialog"
    :model-value="modelValue"
    title="解绑手机号"
    width="480px"
    append-to-body
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    destroy-on-close
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <p class="security-dialog-desc">
      解绑需验证当前手机号。解绑后可重新绑定其它手机号。
    </p>
    <div class="security-dialog-panel">
      <VerifyCodeBox
        account-label="当前手机号"
        :account="displayPhone"
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
import { unbindCurrentUserPhoneApi } from '@/api/user'
import { requestButtonThrottle } from '@/utils/requestThrottle'

/** 11 位国内号脱敏展示 */
function maskPhone(phone: string): string {
  const s = String(phone ?? '').trim()
  if (!/^\d{11}$/.test(s)) return '***'
  return `${s.slice(0, 3)}****${s.slice(-4)}`
}

export default {
  name: 'PhoneUnbindDialog',
  components: { AppDialog, VerifyCodeBox },
  props: {
    modelValue: { type: Boolean, required: true },
    currentPhone: { type: String, required: true },
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
    displayPhone(): string {
      return maskPhone(this.currentPhone)
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
      const phone = String(this.currentPhone ?? '').trim()
      if (!phone) {
        ElMessage.error('未获取到已绑定手机号')
        return
      }
      if (this.countdown > 0) return
      try {
        await sendCodeApi({ account: phone, scene: 'UNBIND_PHONE' })
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
        const result = await unbindCurrentUserPhoneApi({ code })
        const msg = typeof result?.msg === 'string' ? result.msg : ''
        ElMessage.success(msg || '解绑手机号成功')
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

