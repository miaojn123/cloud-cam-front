<template>
  <div class="team-projects-panel">
    <div class="panel-header">
      <h2 class="panel-title">团队项目</h2>
    </div>

    <div class="panel-toolbar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索项目"
        clearable
        class="search-input"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <div class="panel-content">
      <div class="project-grid">
        <div
          v-for="project in filteredProjects"
          :key="project.id"
          class="project-card"
          @click="handleOpenProject(project)"
        >
          <div class="project-card__header">
            <div class="project-card__icon">
              <el-icon :size="24"><Folder /></el-icon>
            </div>
          </div>
          <div class="project-card__body">
            <h3 class="project-card__title">{{ project.name }}</h3>
            <p class="project-card__desc">{{ project.description || '暂无描述' }}</p>
          </div>
          <div class="project-card__footer">
            <div class="project-card__meta">
              <span class="meta-item">
                <el-icon><Calendar /></el-icon>
                {{ formatDate(project.updatedAt) }}
              </span>
            </div>
            <div class="project-card__members">
              <el-avatar
                v-for="member in project.members.slice(0, 3)"
                :key="member.id"
                :size="24"
                :src="member.avatar"
                class="member-avatar"
              >
                {{ member.name?.charAt(0) || '?' }}
              </el-avatar>
              <span v-if="project.members.length > 3" class="member-count">
                +{{ project.members.length - 3 }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <el-empty v-if="filteredProjects.length === 0" description="暂无项目" />
    </div>
  </div>
</template>

<script lang="ts">
interface ProjectMember {
  id: string
  name: string
  avatar: string
}

interface TeamProject {
  id: string
  name: string
  description: string
  updatedAt: string
  members: ProjectMember[]
}

export default {
  name: 'TeamProjectsPanel',
  data() {
    return {
      searchKeyword: '',
      projects: [] as TeamProject[],
    }
  },
  computed: {
    filteredProjects(): TeamProject[] {
      if (!this.searchKeyword.trim()) return this.projects
      const keyword = this.searchKeyword.toLowerCase()
      return this.projects.filter(
        (p) =>
          p.name?.toLowerCase().includes(keyword) ||
          p.description?.toLowerCase().includes(keyword)
      )
    },
  },
  mounted() {
    this.loadProjects()
  },
  methods: {
    async loadProjects() {
      // TODO: 调用 API 获取项目列表
      // 暂时使用模拟数据
      this.projects = [
        {
          id: '1',
          name: '产品文档',
          description: '产品相关文档和设计稿',
          updatedAt: '2024-03-15T10:00:00Z',
          members: [
            { id: '1', name: '张三', avatar: '' },
            { id: '2', name: '李四', avatar: '' },
          ],
        },
        {
          id: '2',
          name: '营销素材',
          description: '市场营销相关素材库',
          updatedAt: '2024-03-10T14:30:00Z',
          members: [
            { id: '3', name: '王五', avatar: '' },
            { id: '1', name: '张三', avatar: '' },
            { id: '4', name: '赵六', avatar: '' },
            { id: '5', name: '钱七', avatar: '' },
          ],
        },
      ]
    },
    formatDate(dateStr: string): string {
      if (!dateStr) return '-'
      return new Date(dateStr).toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
      })
    },
    handleOpenProject(project: TeamProject) {
      ElMessage.info(`打开项目: ${project.name}`)
    },
  },
}
</script>

<style scoped>
.team-projects-panel {
  background: #ffffff;
  border-radius: 8px;
  padding: 24px;
}

.panel-header {
  margin-bottom: 20px;
}

.panel-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.panel-desc {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.panel-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
}

.search-input {
  max-width: 300px;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.project-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.project-card:hover {
  border-color: var(--app-brand-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.project-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.project-card__icon {
  width: 48px;
  height: 48px;
  background: #f3f4f6;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--app-brand-primary);
}

.project-card__body {
  margin-bottom: 16px;
}

.project-card__title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.project-card__desc {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}

.project-card__meta {
  display: flex;
  gap: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #9ca3af;
}

.project-card__members {
  display: flex;
  align-items: center;
}

.member-avatar {
  margin-left: -6px;
  border: 2px solid #ffffff;
}

.member-avatar:first-child {
  margin-left: 0;
}

.member-count {
  margin-left: 6px;
  font-size: 12px;
  color: #9ca3af;
}
</style>
