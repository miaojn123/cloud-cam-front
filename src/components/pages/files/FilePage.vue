<template>
  <div class="file-page" :class="{ 'file-page--team': sidebarKey === 'team' }">
    <FilesLayout :show-detail="showDetail">
      <template #nav>
        <UserNav :user="getUserSummary()" @command="handleNavCommand" />
        <div class="file-toolbar" role="toolbar" aria-label="文件工具栏">
          <div class="file-toolbar__left">
            <!-- 团队信息：后续接入接口后替换为动态数据 -->
            <el-button
              class="file-toolbar__team"
              text
              aria-label="当前团队"
              @click="handleTeamClick"
            >
              <el-icon :size="18" class="file-toolbar__team-icon"><OfficeBuilding /></el-icon>
              <span class="file-toolbar__team-name">MY CAM TEAM</span>
            </el-button>
            <el-button class="file-toolbar__btn" @click="handleCreateFile">
              <el-icon :size="16" class="file-toolbar__btn-icon"><DocumentAdd /></el-icon>
              新建文件
            </el-button>
            <el-button class="file-toolbar__btn" @click="handleCreateFolder">
              <el-icon :size="16" class="file-toolbar__btn-icon"><FolderAdd /></el-icon>
              新建文件夹
            </el-button>
            <el-button class="file-toolbar__btn" @click="handleImportFile">
              <el-icon :size="16" class="file-toolbar__btn-icon"><Upload /></el-icon>
              导入文件
            </el-button>

            <el-input
              v-model="search"
              class="file-toolbar__search"
              placeholder="搜索文件 / 文件夹名"
              clearable
            >
              <template #prefix>
                <el-icon :size="18"><Search /></el-icon>
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
            :loading="loading || filesLoading"
            @row-click="onRowClick"
            @row-contextmenu="onRowContextMenu"
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

    <ContextMenu
      :visible="contextMenuVisible"
      :x="contextMenuPos.x"
      :y="contextMenuPos.y"
      :items="contextMenuItems"
      @close="onContextMenuClose"
      @select="onContextMenuSelect"
    />
  </div>
</template>

<script lang="ts">
import FilesLayout from '@/components/pages/files/FilesLayout.vue'
import UserNav from '@/components/pages/user/UserNav.vue'
import FilesSidebar from '@/components/pages/files/FilesSidebar.vue'
import FilesListHeader from '@/components/pages/files/FilesListHeader.vue'
import FilesTable from '@/components/pages/files/FilesTable.vue'
import ContextMenu from '@/components/pages/files/ContextMenu.vue'
import type { FileItem, SidebarKey, ViewMode } from '@/components/pages/files/types'
import { filterFilesByQuery } from '@/components/pages/files/mock'
import { getContextMenuItems } from '@/components/pages/files/contextMenu/getItems'
import type { ContextMenuItem, ContextMenuPos } from '@/components/pages/files/contextMenu/types'
import { isDesktopEmbed, preserveDesktopClientQuery } from '@/utils/desktopBridge'
import type { UserSummary } from '@/types/user'
import { useFiles } from '@/composables/files/useFiles'

const ROUTE_TO_SIDEBAR_KEY: Readonly<Record<string, SidebarKey>> = {
  '/recent-files': 'recent',
  '/personal-files': 'personal',
  '/team-files': 'team',
  '/shared-files': 'sharedByMe',
  '/received-files': 'sharedToMe',
  '/recycle-bin': 'trash',
  '/files': 'personal',
} as const

const SIDEBAR_KEY_TO_ROUTE: Readonly<Record<SidebarKey, string>> = {
  recent: '/recent-files',
  personal: '/personal-files',
  team: '/team-files',
  sharedByMe: '/shared-files',
  sharedToMe: '/received-files',
  trash: '/recycle-bin',
} as const

const TEST_WORKSPACE_UUID = '550e8400-e29b-41d4-a716-446655440000'

export default {
  name: 'FilePage',
  components: {
    FilesLayout,
    UserNav,
    FilesSidebar,
    FilesListHeader,
    FilesTable,
    ContextMenu,
  },
  data() {
    return {
      loading: false,
      sidebarKey: 'personal' as SidebarKey,
      search: '',
      viewMode: 'table' as ViewMode,
      showDetail: false,
      contextMenuVisible: false,
      contextMenuPos: { x: 0, y: 0 } as ContextMenuPos,
      contextMenuItems: [] as ContextMenuItem[],
      contextMenuRow: null as FileItem | null,
    }
  },
  computed: {
    isDesktopEmbedMode(): boolean {
      return isDesktopEmbed(this.$route.query)
    },
    user() {
      return this.$userStore.user
    },
    filesStore() {
      return this.$filesStore
    },
    files(): FileItem[] {
      return this.filesStore.items
    },
    filesLoading(): boolean {
      return this.filesStore.loading
    },
    filteredFiles(): FileItem[] {
      return filterFilesByQuery(this.files, this.search)
    },
    pageTitle(): string {
      const map: Record<SidebarKey, string> = {
        recent: '最近文件',
        personal: '个人文件',
        team: '团队文件',
        sharedByMe: '我分享的',
        sharedToMe: '我收到的',
        trash: '回收站',
      }
      return map[this.sidebarKey] || '个人文件'
    },
  },
  watch: {
    $route: {
      immediate: true,
      handler() {
        if (this.$route.name === 'workspace') {
          if (this.sidebarKey !== 'personal') this.sidebarKey = 'personal'
          return
        }
        const nextKey = ROUTE_TO_SIDEBAR_KEY[this.$route.path]
        if (nextKey && nextKey !== this.sidebarKey) this.sidebarKey = nextKey
      },
    },
    sidebarKey: {
      immediate: true,
      async handler() {
        const nextPath = SIDEBAR_KEY_TO_ROUTE[this.sidebarKey]
        const keepWorkspaceRoute = this.$route.name === 'workspace' && this.sidebarKey === 'personal'
        if (nextPath && this.$route.path !== nextPath && !keepWorkspaceRoute) {
          // 仅在路径不一致时同步，避免 watch 循环。
          const desktopQuery = preserveDesktopClientQuery(this.$route.query)
          this.$router.replace(Object.keys(desktopQuery).length ? { path: nextPath, query: desktopQuery } : nextPath)
        }
        await this.fetchFilesBySidebar(this.sidebarKey)
      }
    }
  },
  methods: {
    handleTeamClick() {
      this.$router.push('/team')
    },
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
      // 顶栏头像菜单：集中处理跳转，避免组件间相互依赖。
      if (cmd === 'team') return this.$router.push('/team')
      if (cmd === 'userInfo') {
        return this.$router.push('/profile-personal')
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
    async fetchFilesBySidebar(key: SidebarKey) {
      const filesService = useFiles()
      try {
        await filesService.fetchFilesBySidebarKey(key)
      } catch {
        ElMessage.error('获取文件列表失败')
      }
    },
    onRowClick() {
      this.$router.push(`/workspace/${TEST_WORKSPACE_UUID}`)
    },
    onRowContextMenu(payload: { row: FileItem; event: MouseEvent }) {
      const { row, event } = payload
      this.contextMenuRow = row
      this.contextMenuItems = getContextMenuItems(this.sidebarKey, row)
      this.contextMenuPos = { x: event.clientX, y: event.clientY }
      this.contextMenuVisible = true
    },
    onContextMenuClose() {
      this.contextMenuVisible = false
    },
    onContextMenuSelect(id: string) {
      // 这里先用消息占位，后续接入具体菜单行为。
      if (!this.contextMenuRow) return
      ElMessage.info(`${this.pageTitle}：${id}`)
    },
  }
}
</script>

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
  padding: 0 8px;
  background: #ffffff;
  border-bottom: 1px solid var(--files-border-color, lightgray);
}

.file-toolbar__left {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.file-toolbar__team {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  height: 32px;
  line-height: 32px;
  margin-left: 8px;
  width: 212px;
  padding: 0 12px;
  box-sizing: border-box;
  border-radius: 6px;
  color: #111827 !important;
}

.file-toolbar__team-icon {
  color: #6b7280;
}

.file-toolbar__team-name {
  display: inline-block;
  flex: 1 1 auto;
  min-width: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-toolbar__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--app-brand-primary) !important;
  border-color: var(--app-brand-primary) !important;
  color: #ffffff !important;
  height: 32px;
  line-height: 1;
  padding: 0 14px;
  border-radius: 6px;
}

.file-toolbar__btn :deep(span) {
  display: inline-flex;
  align-items: center;
}

.file-toolbar__btn-icon {
  display: inline-flex;
  align-items: center;
  margin-right: 6px;
}

.file-toolbar__btn:hover,
.file-toolbar__btn:focus {
  background: var(--app-brand-primary-hover) !important;
  border-color: var(--app-brand-primary-hover) !important;
}

.file-toolbar__search {
  width: 420px;
  margin-left: 12px;
}

.file-toolbar__search :deep(.el-input__wrapper) {
  border-radius: 999px;
}

.file-main {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
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

.file-page--team :deep(.files-list-header__breadcrumb-title) {
  font-size: 17px;
}

.file-page--team :deep(.files-table__table .el-table__body td) {
  font-size: 12px;
}
</style>

