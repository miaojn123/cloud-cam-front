<script lang="ts">
import type { PropType } from 'vue'

type HelpLink = {
  text: string
  onClick?: () => void
}

export default {
  name: 'VerifyCodeBox',
  props: {
    accountLabel: { type: String, required: true },
    account: { type: String, required: true },
    accountPlaceholder: { type: String, default: '' },
    accountReadonly: { type: Boolean, default: false },
    showAccount: { type: Boolean, default: true },
    code: { type: String, required: true },
    codePlaceholder: { type: String, default: '请输入验证码' },
    countdown: { type: Number, required: true },
    sendText: { type: String, default: '发送验证码' },
    helpLink: { type: Object as PropType<HelpLink | null>, default: null },
  },
  emits: ['update:account', 'update:code', 'send-code'],
  computed: {
    sendButtonText(): string {
      return this.countdown > 0 ? `${this.countdown}s` : this.sendText
    },
    sendDisabled(): boolean {
      return this.countdown > 0
    },
  },
  methods: {
    onSendCode() {
      if (this.sendDisabled) return
      this.$emit('send-code')
    },
    onSendKeydown(e: KeyboardEvent) {
      if (e.key !== 'Enter') return
      e.preventDefault()
      this.onSendCode()
    },
    onHelpClick() {
      this.helpLink?.onClick?.()
    },
  },
}
</script>

<template>
  <div class="verify-box">
    <div v-if="showAccount" class="verify-row">
      <div class="verify-label">{{ accountLabel }}</div>
      <el-input
        v-if="!accountReadonly"
        :model-value="account"
        class="verify-input"
        :placeholder="accountPlaceholder"
        :autocomplete="accountLabel === '邮箱' ? 'email' : 'tel'"
        @update:model-value="$emit('update:account', $event)"
      />
      <div v-else class="verify-readonly">{{ account }}</div>
    </div>

    <div class="verify-row">
      <div class="verify-label">验证码</div>
      <div class="verify-code">
        <el-input
          :model-value="code"
          class="verify-input"
          :placeholder="codePlaceholder"
          autocomplete="one-time-code"
          @update:model-value="$emit('update:code', $event)"
        >
          <template #suffix>
            <button
              type="button"
              class="verify-send"
              :class="{ 'verify-send--disabled': sendDisabled }"
              :disabled="sendDisabled"
              @click="onSendCode"
              @keydown="onSendKeydown"
            >
              {{ sendButtonText }}
            </button>
          </template>
        </el-input>
      </div>
    </div>

    <div v-if="helpLink" class="verify-help">
      <button type="button" class="verify-help__link" @click="onHelpClick">
        {{ helpLink.text }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.verify-box {
  width: 520px;
  max-width: 100%;
}

.verify-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
}

.verify-row:first-child {
  margin-top: 0;
}

.verify-label {
  width: 86px;
  flex: 0 0 86px;
  font-size: 14px;
  color: #111827;
}

.verify-input {
  flex: 1 1 auto;
  min-width: 0;
}

.verify-code {
  flex: 1 1 auto;
  min-width: 0;
}

.verify-send {
  flex: 0 0 auto;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  color: #2f7cff;
  font-size: 12px;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  text-decoration: none;
}

.verify-send:hover:not(.verify-send--disabled) {
  color: #1d5ed8;
  text-decoration: none;
}

.verify-send--disabled {
  color: #9ca3af;
  cursor: default;
  text-decoration: none;
}

.verify-readonly {
  flex: 1 1 auto;
  min-width: 0;
  height: 32px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
  font-size: 14px;
  color: #111827;
}

.verify-help {
  margin-top: 12px;
}

.verify-help__link {
  padding: 0;
  border: none;
  background: none;
  color: #2f7cff;
  font-size: 14px;
  cursor: pointer;
}

.verify-help__link:hover {
  text-decoration: underline;
}

/* 中文注释：覆盖 el-input 默认圆角与高度，贴近弹窗统一风格 */
.verify-input :deep(.el-input__wrapper) {
  height: 32px;
  border-radius: 8px;
}

.verify-input :deep(.el-input__suffix) {
  margin-left: 8px;
}
</style>

