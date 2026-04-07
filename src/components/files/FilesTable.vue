<template>
  <div class="files-table">
    <el-table
      :data="items"
      :border="true"
      :stripe="false"
      :fit="true"
      height="100%"
      v-loading="loading"
      class="files-table__table"
      @row-contextmenu="onRowContextMenu"
    >
      <el-table-column prop="name" label="文件名" sortable min-width="160" show-overflow-tooltip>
        <template #default="{ row }">
          <span class="files-table__name">
            <el-icon :size="16" class="files-table__name-icon">
              <EpFolder v-if="row.kind === 'folder'" />
              <EpDocument v-else />
            </el-icon>
            <span class="files-table__name-text">{{ row.name }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="updatedAt" label="最近编辑时间" sortable min-width="160" show-overflow-tooltip />
      <el-table-column prop="owner" label="所有者" min-width="160" show-overflow-tooltip />
      <el-table-column label="类型" sortable min-width="160" show-overflow-tooltip :formatter="typeFormatter" />
      <el-table-column label="文件大小" sortable min-width="160" show-overflow-tooltip :formatter="sizeFormatter" />
    </el-table>
  </div>
</template>

<script lang="ts">
import type { PropType } from 'vue'
import type { FileItem } from './types'
import { formatBytes } from './mock'

export default {
  name: 'FilesTable',
  emits: ['row-contextmenu'],
  props: {
    items: {
      type: Array as PropType<FileItem[]>,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    sizeFormatter(row: FileItem) {
      return formatBytes(row.sizeBytes)
    },
    typeFormatter(row: FileItem) {
      return row.kind === 'folder' ? '文件夹' : '文件'
    },
    onRowContextMenu(row: FileItem, column: unknown, e: MouseEvent) {
      e.preventDefault()
      this.$emit('row-contextmenu', { row, column, event: e })
    },
  },
}
</script>

<style scoped>
.files-table {
  flex: 1 1 auto;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}

.files-table__table {
  height: 100%;
  width: 100%;
}

.files-table :deep(.el-table) {
  --el-table-border-color: #f0f0f0;
  --el-table-header-bg-color: #ffffff;
  --el-table-bg-color: #ffffff;
}

.files-table :deep(.el-table__header th) {
  background: #ffffff !important;
  font-size: 15px !important;
  height: 48px !important;
  border-right: 2px solid rgb(240, 240, 240) !important;
}

.files-table :deep(.el-table__header th .cell) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 16px;
  text-align: left;
}

.files-table :deep(.el-table__body td) {
  font-size: 13px;
  color: #6b7280;
  font-weight: 600;
}

.files-table :deep(.el-table__body td .cell) {
  padding: 0 16px;
  text-align: left;
}

.files-table__name {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.files-table__name-icon {
  color: #6b7280;
  flex: 0 0 auto;
}

.files-table__name-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
