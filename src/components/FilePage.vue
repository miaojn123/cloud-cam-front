<script lang="ts">
import FilesLayout from '@/components/files/FilesLayout.vue'
import AppMainNav from '@/components/layout/AppMainNav.vue'
import FilesSidebar from '@/components/files/FilesSidebar.vue'
import FilesListHeader from '@/components/files/FilesListHeader.vue'
import FilesTable from '@/components/files/FilesTable.vue'
import type { FileItem, SidebarKey, UserSummary, ViewMode } from '@/components/files/types'
import { filterFilesByQuery, mockFilesForSidebar } from '@/components/files/mock'

export default {
  name: 'FilePage',
  components: {
    FilesLayout,
    AppMainNav,
    FilesSidebar,
    FilesListHeader,
    FilesTable,
  },
  data() {
    return {
      loading: false,
      sidebarKey: 'personal' as SidebarKey,
      search: '',
      viewMode: 'table' as ViewMode,
      showDetail: false,
      files: [] as FileItem[],
    }
  },
  computed: {
    user() {
      return this.$userStore.currentUser
    },
    filteredFiles(): FileItem[] {
      return filterFilesByQuery(this.files, this.search)
    },
    pageTitle(): string {
      const map: Record<SidebarKey, string> = {
        recent: '最近文件',
        personal: '个人文件',
        sharedByMe: '我分享的',
        sharedToMe: '我收到的',
        historyLinks: '历史链接',
        trash: '回收站',
      }
      return map[this.sidebarKey] || '个人文件'
    },
  },
  watch: {
    sidebarKey: {
      immediate: true,
      handler() {
        // 中文：后端文件接口未接入前，这里先根据菜单返回 mock；接入后替换为 service 调用即可。
        // 当前截图为空态，因此 mock 默认返回空数组。
        this.files = mockFilesForSidebar(this.sidebarKey)
      }
    }
  },
  async mounted() {
    if (!this.user) {
      this.loading = true
      try {
        await this.$userStore.fetchCurrentUser()
      } catch {
        ElMessage.error('获取用户信息失败')
      } finally {
        this.loading = false
      }
    }
  },
  methods: {
    getUserSummary(): UserSummary | null {
      const u = this.user
      if (!u) return null
      const avatar = u.avatar && String(u.avatar).trim() ? String(u.avatar).trim() : ''
      return {
        userName: u.userName || '',
        nickName: u.nickName || '',
        avatar,
      }
    },
    async handleLogout() {
      this.loading = true
      try {
        await this.$userStore.logout()
        ElMessage.success('退出成功')
      } catch {
        ElMessage.error('退出失败')
      } finally {
        this.loading = false
        this.$router.push('/login')
      }
    },
    handleNavCommand(cmd: string) {
      if (cmd === 'userInfo') {
        return this.$router.push('/personalProfile/personal')
      }
      if (cmd === 'logout') return this.handleLogout()
      ElMessage.info('功能开发中')
    },
    handleCreateFolder() {
      ElMessage.info('新建文件夹：待接入接口')
    },
    handleCreateFile() {
      ElMessage.info('新建文件：待接入接口')
    },
    handleImportFile() {
      ElMessage.info('导入文件：待接入接口')
    },
  }
}
</script>

<template>
  <div class="file-page">
    <FilesLayout :show-detail="showDetail">
      <template #nav>
        <AppMainNav :user="getUserSummary()" @command="handleNavCommand" />
        <div class="file-toolbar" role="toolbar" aria-label="文件工具栏">
          <div class="file-toolbar__left">
            <el-button class="file-toolbar__btn" @click="handleCreateFile">新建文档</el-button>
            <el-button class="file-toolbar__btn" @click="handleCreateFolder">新建文件夹</el-button>
            <el-button class="file-toolbar__btn" @click="handleImportFile">导入文件</el-button>

            <el-input
              v-model="search"
              class="file-toolbar__search"
              placeholder="搜索文件 / 文件夹名"
              clearable
            >
              <template #prefix>
                <el-icon :size="18"><EpSearch /></el-icon>
              </template>
            </el-input>
          </div>
        </div>
      </template>

      <template #aside>
        <FilesSidebar v-model="sidebarKey" />
      </template>

      <template #main>
        <div class="file-main">
          <FilesListHeader
            :title="pageTitle"
            :show-detail="showDetail"
            :view-mode="viewMode"
            @toggle-detail="() => (showDetail = !showDetail)"
            @update:view-mode="(m) => (viewMode = m)"
          />

          <FilesTable
            :items="filteredFiles"
            :loading="loading"
          />
        </div>
      </template>

      <template #detail>
        <div class="file-detail">
          <div class="file-detail__title">详细信息</div>
          <div class="file-detail__hint">占位：后续展示选中文件信息</div>
        </div>
      </template>
    </FilesLayout>
  </div>
</template>

<style scoped>
.file-page {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.file-toolbar {
  height: 50px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  background: #ffffff;
  border-bottom: 1px solid #eef0f3;
}

.file-toolbar__left {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.file-toolbar__btn {
  background: #0d476b !important;
  border-color: #0d476b !important;
  color: #ffffff !important;
  height: 32px;
  padding: 0 14px;
  border-radius: 6px;
  font-weight: 600;
}

.file-toolbar__btn:hover,
.file-toolbar__btn:focus {
  background: #0b3e5e !important;
  border-color: #0b3e5e !important;
}

.file-toolbar__search {
  width: 420px;
}

.file-main {
  height: 100%;
}

.file-detail {
  height: 100%;
  padding: 12px;
}

.file-detail__title {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
}

.file-detail__hint {
  font-size: 12px;
  color: #6b7280;
}
</style>
