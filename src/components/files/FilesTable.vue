<script lang="ts">
import type { PropType } from 'vue'
import type { FileItem } from './types'
import { formatBytes } from './mock'

export default {
  name: 'FilesTable',
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
  },
}
</script>

<template>
  <div class="files-table">
    <el-table
      :data="items"
      :border="true"
      :stripe="false"
      height="100%"
      v-loading="loading"
      class="files-table__table"
    >
      <el-table-column prop="name" label="文件名" sortable min-width="240" />
      <el-table-column prop="updatedAt" label="最近编辑时间" sortable width="240" />
      <el-table-column prop="owner" label="所有者" width="180" />
      <el-table-column label="类型" sortable width="180" :formatter="typeFormatter" />
      <el-table-column label="文件大小" sortable width="180" :formatter="sizeFormatter" />
      <el-table-column width="120" />
    </el-table>
  </div>
</template>

<style scoped>
.files-table {
  height: calc(100% - 68px);
  overflow: hidden;
}

.files-table__table {
  height: 100%;
}

.files-table :deep(.el-table) {
  --el-table-border-color: #f0f0f0;
  --el-table-header-bg-color: #ffffff;
  --el-table-bg-color: #ffffff;
}

.files-table :deep(.el-table__header th) {
  background: #ffffff !important;
  font-size: 16px !important;
  height: 48px !important;
  padding-left: 16px !important;
  border-right: 2px solid rgb(240, 240, 240) !important;
}

.files-table :deep(.el-table__body td) {
  font-size: 13px;
  color: #111827;
}
</style>

