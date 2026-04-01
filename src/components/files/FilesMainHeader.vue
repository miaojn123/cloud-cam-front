<script lang="ts">
export default {
  name: 'FilesMainHeader',
  props: {
    search: {
      type: String,
      required: true,
    },
  },
  emits: ['update:search', 'new-doc', 'new-folder', 'import-files'],
  methods: {
    onSearchInput(v: string) {
      this.$emit('update:search', v)
    },
    onImportFilesChange(_uploadFile: unknown, uploadFiles: Array<{ raw?: File }>) {
      const files = uploadFiles.map((x) => x.raw).filter((x): x is File => x instanceof File)
      this.$emit('import-files', files)
    },
    openFilePicker() {
      const ref = this.$refs.importUploadRef as { handleClick?: () => void } | undefined
      ref?.handleClick?.()
    },
  },
}
</script>

<template>
  <header class="main__header">
    <el-button
      class="el-button base-btn--blue"
      :style="{ width: '128px', height: '36px' }"
      @click="$emit('new-doc')"
    >
      <span>
        <el-icon :size="20"><EpDocumentAdd /></el-icon>
        <span style="margin: 2px 0px 0px 10px">新建文档</span>
      </span>
    </el-button>

    <el-button
      class="el-button base-btn--blue"
      :style="{ width: '128px', height: '36px' }"
      @click="$emit('new-folder')"
    >
      <span>
        <el-icon :size="20"><EpFolderAdd /></el-icon>
        <span style="margin: 2px 0px 0px 10px">新建文件夹</span>
      </span>
    </el-button>

    <el-button
      class="el-button base-btn--blue"
      :style="{ width: '128px', height: '36px' }"
      @click="openFilePicker"
    >
      <span>
        <el-icon :size="20"><EpUploadFilled /></el-icon>
        <span style="margin: 2px 0px 0px 10px">导入文件</span>
      </span>
    </el-button>

    <el-upload
      ref="importUploadRef"
      class="main__header-import-upload"
      :show-file-list="false"
      :auto-upload="false"
      multiple
      :on-change="onImportFilesChange"
    />

    <el-input
      class="el-input el-input--prefix main__header-search"
      :model-value="search"
      placeholder="搜索文件 / 文件夹名"
      @update:model-value="onSearchInput"
    >
      <template #prefix>
        <el-icon :size="18"><EpSearch /></el-icon>
      </template>
    </el-input>
  </header>
</template>

<style scoped>
.main__header {
  height: 64px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #eef0f3;
  background: #ffffff;
}

.base-btn--blue {
  --el-button-bg-color: #1976d2;
  --el-button-border-color: #1976d2;
  --el-button-hover-bg-color: #1565c0;
  --el-button-hover-border-color: #1565c0;
  --el-button-text-color: #ffffff;
  border-radius: 8px;
}

.main__header-search {
  width: 420px;
  margin-left: 8px;
}
</style>

