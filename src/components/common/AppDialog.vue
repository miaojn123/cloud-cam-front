<template>
  <el-dialog
    v-bind="$attrs"
    :model-value="modelValue"
    class="app-dialog"
    :append-to-body="appendToBody"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    :destroy-on-close="destroyOnClose"
    :show-close="showClose"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #header>
      <slot name="header" />
    </template>
    <slot />
    <template #footer>
      <slot name="footer" />
    </template>
  </el-dialog>
</template>

<script lang="ts">
export default {
  name: 'AppDialog',
  inheritAttrs: false,
  props: {
    modelValue: { type: Boolean, required: true },
    appendToBody: { type: Boolean, default: true },
    closeOnClickModal: { type: Boolean, default: false },
    closeOnPressEscape: { type: Boolean, default: false },
    destroyOnClose: { type: Boolean, default: true },
    showClose: { type: Boolean, default: true },
  },
  emits: ['update:modelValue'],
}
</script>

<style>
.app-dialog.el-dialog {
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow:
    0 25px 50px -12px rgba(15, 23, 42, 0.15),
    0 0 0 1px rgba(15, 23, 42, 0.06);
}

.app-dialog .el-dialog__header,
.app-dialog .el-dialog__body,
.app-dialog .el-dialog__footer {
  background-color: #ffffff;
}

.app-dialog .el-dialog__header {
  margin: 0;
  padding: 18px 24px 14px;
  border-bottom: 1px solid #eef2f7;
}

.app-dialog .el-dialog__title {
  font-size: 17px;
  font-weight: 600;
  color: #0f172a;
  letter-spacing: 0.02em;
  line-height: 1.35;
}

.app-dialog .el-dialog__headerbtn {
  top: 14px;
  right: 14px;
  width: 36px;
  height: 36px;
  border-radius: 8px;
}

.app-dialog .el-dialog__headerbtn:hover {
  background-color: transparent;
}

.app-dialog .el-dialog__body {
  padding: 20px 24px 12px;
}

.app-dialog .el-dialog__footer {
  padding: 14px 24px 20px;
  border-top: 1px solid #eef2f7;
}

.app-dialog .el-dialog__footer .el-button + .el-button {
  margin-left: 10px;
}
</style>
