<template>
  <div class="file-page">
    <FilesLayout :show-detail="showDetail">
      <template #nav>
        <FilesNav :user="getUserSummary()" @command="handleNavCommand" />
        <div class="file-toolbar" role="toolbar" aria-label="文件工具栏">
          <div class="file-toolbar__left">
            <!-- 团队信息：后续接入接口后替换为动态数据 -->
            <el-button
              class="file-toolbar__team"
              text
              aria-label="当前团队"
              @click="handleTeamClick"
            >
              <el-icon :size="18" class="file-toolbar__team-icon"><EpOfficeBuilding /></el-icon>
              <span class="file-toolbar__team-name">CLOUD CAM TEAM</span>
            </el-button>
            <el-button class="file-toolbar__btn" @click="handleCreateFile">
              <el-icon :size="16" class="file-toolbar__btn-icon"><EpDocumentAdd /></el-icon>
              新建文档
            </el-button>
            <el-button class="file-toolbar__btn" @click="handleCreateFolder">
              <el-icon :size="16" class="file-toolbar__btn-icon"><EpFolderAdd /></el-icon>
              新建文件夹
            </el-button>
            <el-button class="file-toolbar__btn" @click="handleImportFile">
              <el-icon :size="16" class="file-toolbar__btn-icon"><EpUpload /></el-icon>
              导入文件
            </el-button>

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

<script lang="ts">
import FilesLayout from '@/components/files/FilesLayout.vue'
import FilesNav from '@/components/files/FilesNav.vue'
import FilesSidebar from '@/components/files/FilesSidebar.vue'
import FilesListHeader from '@/components/files/FilesListHeader.vue'
import FilesTable from '@/components/files/FilesTable.vue'
import type { FileItem, SidebarKey, UserSummary, ViewMode } from '@/components/files/types'
import { filterFilesByQuery, mockFilesForSidebar } from '@/components/files/mock'

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

export default {
  name: 'FilePage',
  components: {
    FilesLayout,
    FilesNav,
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
      return this.$userStore.user
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
        const nextKey = ROUTE_TO_SIDEBAR_KEY[this.$route.path]
        if (nextKey && nextKey !== this.sidebarKey) this.sidebarKey = nextKey
      },
    },
    sidebarKey: {
      immediate: true,
      handler() {
        const nextPath = SIDEBAR_KEY_TO_ROUTE[this.sidebarKey]
        if (nextPath && this.$route.path !== nextPath) {
          // 只在“路径不一致”时同步，避免 watch 循环
          this.$router.replace(nextPath)
        }
        // 后端文件接口未接入前，这里先根据菜单返回 mock；接入后替换为 service 调用即可。
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
      // 顶栏头像菜单：集中处理跳转，避免组件间相互依赖
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
  padding: 0 16px;
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
  margin-left: 14px;
  width: 180px;
  padding: 0 8px;
  border-radius: 6px;
  color: #111827 !important;
}

.file-toolbar__team-icon {
  color: #6b7280;
}

.file-toolbar__team-name {
  display: inline-block;
  width: 120px;
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
  line-height: 32px;
  padding: 0 14px;
  border-radius: 6px;
}

.file-toolbar__btn-icon {
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
</style>
