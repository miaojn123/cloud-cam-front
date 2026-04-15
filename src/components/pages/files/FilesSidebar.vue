<template>
  <div class="files-sidebar">
    <el-menu
      class="files-sidebar__menu"
      :default-active="modelValue"
      @select="onSelect"
    >
      <el-menu-item
        v-for="it in items"
        :key="it.key"
        :index="it.key"
        class="files-sidebar__menu-item"
      >
        <el-icon class="files-sidebar__icon">
          <component :is="it.icon" />
        </el-icon>
        <span class="files-sidebar__label">{{ it.label }}</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script lang="ts">
import type { PropType } from 'vue'
import type { SidebarKey } from './types'

type MenuItem = {
  key: SidebarKey
  label: string
  // 这里使用全局注册的组件名字符串，避免本地 import 解耦并减少保留字冲突。
  icon: string
}

export default {
  name: 'FilesSidebar',
  props: {
    modelValue: {
      type: String as PropType<SidebarKey>,
      required: true,
    },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      items: [
        { key: 'recent', label: '最近文件', icon: 'Clock' },
        { key: 'personal', label: '个人文件', icon: 'UserFilled' },
        { key: 'team', label: '团队文件', icon: 'OfficeBuilding' },
        { key: 'sharedByMe', label: '我分享的', icon: 'Share' },
        { key: 'sharedToMe', label: '我收到的', icon: 'Box' },
        { key: 'trash', label: '回收站', icon: 'Delete' },
      ] as MenuItem[],
    }
  },
  methods: {
    onSelect(key: string) {
      this.$emit('update:modelValue', key as SidebarKey)
    },
  },
}
</script>

<style scoped>
.files-sidebar {
  height: 100%;
  padding: 10px 8px;
}

.files-sidebar__menu {
  border-right: none;
}

.files-sidebar :deep(.el-menu-item) {
  height: 44px;
  line-height: 44px;
  border-radius: 6px;
  margin: 2px 6px;
}

.files-sidebar :deep(.el-menu-item.is-active) {
  background: #e8f0ff;
  color: #1d4ed8;
}

.files-sidebar :deep(.el-menu-item.is-active .files-sidebar__label) {
  font-weight: 700;
}

.files-sidebar__icon {
  margin-right: 10px;
  color: inherit;
}

.files-sidebar__label {
  font-size: 16px;
}
</style>
