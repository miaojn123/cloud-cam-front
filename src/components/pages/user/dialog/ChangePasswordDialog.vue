<template>
  <AppDialog
    class="change-password-dialog"
    :model-value="modelValue"
    title="修改密码"
    width="480px"
    append-to-body
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    destroy-on-close
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <p class="security-dialog-desc">
      新密码长度 8～20 位，须同时包含字母与数字。
    </p>
    <el-form
      ref="passwordForm"
      class="change-password-dialog__form"
      :model="form"
      :rules="rules"
      label-position="top"
      require-asterisk-position="right"
    >
      <el-form-item label="原密码" prop="oldPassword">
        <el-input
          v-model="form.oldPassword"
          type="password"
          show-password
          placeholder="请输入原密码"
          autocomplete="current-password"
          class="change-password-dialog__input"
        />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="form.newPassword"
          type="password"
          show-password
          placeholder="请输入新密码"
          autocomplete="new-password"
          class="change-password-dialog__input"
        />
      </el-form-item>
      <el-form-item label="确认新密码" prop="confirmPassword">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          show-password
          placeholder="请再次输入新密码"
          autocomplete="new-password"
          class="change-password-dialog__input"
        />
      </el-form-item>
    </el-form>
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
import type { FormInstance, FormRules } from 'element-plus'
import { updateCurrentUserPasswordApi } from '@/api/user'
import { buildChangePasswordFormRules, type ChangePasswordFormModel } from '@/utils/validators'

export default {
  name: 'ChangePasswordDialog',
  components: { AppDialog },
  props: {
    modelValue: { type: Boolean, required: true },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      form: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      } as ChangePasswordFormModel,
      rules: {} as FormRules<ChangePasswordFormModel>,
      submitting: false,
    }
  },
  watch: {
    modelValue(v: boolean) {
      if (v) this.resetForm()
    },
    'form.newPassword'() {
      if (this.form.confirmPassword) {
        this.$nextTick(() => {
          ;(this.$refs.passwordForm as FormInstance | undefined)?.validateField('confirmPassword')
        })
      }
    },
  },
  created() {
    this.rules = buildChangePasswordFormRules(() => this.form)
  },
  methods: {
    resetForm() {
      this.form.oldPassword = ''
      this.form.newPassword = ''
      this.form.confirmPassword = ''
      this.submitting = false
      this.$nextTick(() => {
        ;(this.$refs.passwordForm as FormInstance | undefined)?.resetFields()
      })
    },
    close() {
      this.$emit('update:modelValue', false)
    },
    async onConfirm() {
      const f = this.$refs.passwordForm as FormInstance | undefined
      if (!f) return
      try {
        await f.validate()
      } catch {
        return
      }
      const oldP = this.form.oldPassword
      const newP = String(this.form.newPassword ?? '').trim()
      if (this.submitting) return
      this.submitting = true
      try {
        const result = await updateCurrentUserPasswordApi(oldP, newP)
        const msg = typeof result?.msg === 'string' ? result.msg : ''
        ElMessage.success(msg || '密码重置成功')
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

.change-password-dialog__form {
  max-width: 100%;
}

.change-password-dialog__form :deep(.el-form-item) {
  margin-bottom: 14px;
}

.change-password-dialog__form :deep(.el-form-item:last-child) {
  margin-bottom: 0;
}

.change-password-dialog__input {
  width: 100%;
  max-width: 100%;
}
</style>
