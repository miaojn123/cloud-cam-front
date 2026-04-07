<template>
  <el-dialog
    class="profile-security-dialog phone-bind-dialog"
    :model-value="modelValue"
    title="绑定手机号"
    width="480px"
    append-to-body
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    destroy-on-close
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <p class="security-dialog-desc">
      绑定后可使用该手机号登录、找回密码及接收安全验证短信。
    </p>
    <div class="security-dialog-panel">
      <VerifyCodeBox
        account-label="手机号"
        :account="phone"
        account-placeholder="请输入手机号"
        :code="code"
        :countdown="countdown"
        @update:account="phone = $event"
        @update:code="code = $event"
        @send-code="sendBindCode"
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
  </el-dialog>
</template>

<script lang="ts">
import VerifyCodeBox from '@/components/common/VerifyCodeBox.vue'
import { sendCodeApi } from '@/api/auth'
import { bindCurrentUserPhoneApi } from '@/api/user'
import { requestButtonThrottle } from '@/utils/requestThrottle'
import { isCnMobilePhone, Msg } from '@/utils/validators'

export default {
  name: 'PhoneBindDialog',
  components: { VerifyCodeBox },
  props: {
    modelValue: { type: Boolean, required: true },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      phone: '',
      code: '',
      countdown: 0,
      countdownTimer: null as ReturnType<typeof setInterval> | null,
      submitting: false,
    }
  },
  watch: {
    modelValue(v: boolean) {
      if (v) this.resetForm()
    },
  },
  created() {
    this.sendBindCode = requestButtonThrottle(this.sendBindCodeCore.bind(this))
  },
  beforeUnmount() {
    this.stopCountdown()
  },
  methods: {
    sendBindCode(): void {
      /* created 中替换为节流包装 */
    },
    resetForm() {
      this.stopCountdown()
      this.phone = ''
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
    async sendBindCodeCore() {
      const phone = this.phone.trim()
      if (!isCnMobilePhone(phone)) {
        ElMessage.error('请输入正确手机号')
        return
      }
      if (this.countdown > 0) return
      try {
        await sendCodeApi(phone, 'BIND_PHONE')
        ElMessage.success('验证码已发送')
        this.startCountdown(60)
      } catch {
        // 拦截器已提示
      }
    },
    async onConfirm() {
      const phone = this.phone.trim()
      const code = this.code.trim()
      if (!isCnMobilePhone(phone)) {
        ElMessage.error(Msg.cnPhone)
        return
      }
      if (!code) {
        ElMessage.error('请输入验证码')
        return
      }
      if (this.submitting) return
      this.submitting = true
      try {
        const result = await bindCurrentUserPhoneApi(phone, code)
        const msg = typeof result?.msg === 'string' ? result.msg : ''
        ElMessage.success(msg || '绑定手机号成功')
        await this.$userStore.fetchCurrentUser()
        this.close()
      } catch {
        // 拦截器已提示
      } finally {
        this.submitting = false
      }
    },
  },
}
</script>

<style src="./security-dialog.css"></style>
