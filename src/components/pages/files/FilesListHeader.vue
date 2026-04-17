<template>
  <div class="files-list-header">
    <div class="files-list-header__breadcrumb">
      <span class="files-list-header__breadcrumb-title">{{ title }}</span>
    </div>
    <div class="files-list-header__right">
      <el-button
        class="files-list-header__ghost-btn"
        text
        :style="{ height: '32px' }"
        @click="onToggleDetail"
      >
        <span class="files-list-header__ghost-inner">
          <el-icon :size="18" class="files-list-header__info"><InfoFilled /></el-icon>
          <span class="files-list-header__detail-label">详细信息</span>
        </span>
      </el-button>

      <div class="files-list-header__view">
        <el-button
          class="files-list-header__view-btn"
          text
          :class="{ 'files-list-header__view-btn--clicked': viewMode === 'table' }"
          :style="{ width: '32px', height: '32px' }"
          @click="setView('table')"
        >
          <el-icon><Menu /></el-icon>
        </el-button>
        <el-button
          class="files-list-header__view-btn"
          text
          :class="{ 'files-list-header__view-btn--clicked': viewMode === 'grid' }"
          :style="{ width: '32px', height: '32px' }"
          @click="setView('grid')"
        >
          <el-icon><Grid /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { PropType } from 'vue'
import type { ViewMode } from './types'

export default {
  name: 'FilesListHeader',
  props: {
    title: {
      type: String,
      required: true,
    },
    showDetail: {
      type: Boolean,
      required: true,
    },
    viewMode: {
      type: String as PropType<ViewMode>,
      required: true,
    },
  },
  emits: ['toggle-detail', 'update:viewMode'],
  methods: {
    onToggleDetail() {
      this.$emit('toggle-detail')
    },
    setView(mode: ViewMode) {
      this.$emit('update:viewMode', mode)
    },
  },
}
</script>

<style scoped>
.files-list-header {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: #ffffff;
  border-bottom: 1px solid var(--files-border-color, lightgray);
}

.files-list-header__breadcrumb {
  width: 100%;
  margin: 0;
  user-select: none;
}

.files-list-header__breadcrumb-title {
  font-size: 18px;
  color: dimgray;
  cursor: default;
  padding: 0 6px;
}

.files-list-header__right {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-right: 14px;
}

.files-list-header__ghost-btn {
  color: dimgray !important;
  padding: 0 12px !important;
  border-radius: 4px;
}

.files-list-header__ghost-inner {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 32px;
}

.files-list-header__info {
  color: dimgray;
}

.files-list-header__detail-label {
  font-size: 16px;
  line-height: 32px;
}

.files-list-header__view {
  display: inline-flex;
  gap: 2px;
}

.files-list-header__view-btn {
  color: #111827 !important;
  border-radius: 4px;
}

.files-list-header__view-btn--clicked {
  background: lightgray !important;
}
</style>
