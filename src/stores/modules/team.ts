import { defineStore } from 'pinia'

export interface Team {
  id: string
  teamId?: string  // 兼容后端返回的字段名
  name: string
  teamName?: string  // 兼容后端返回的字段名
  region?: string
  industry?: string
  email?: string
  role?: 'owner' | 'admin' | 'member'
  joinedAt?: string
  status?: 'pending' | 'reviewing'
  inviterName?: string
  invitedAt?: string
}

interface TeamState {
  myTeams: Team[]
  currentTeamId: string | null
  pendingTeams: Team[]
}

export const useTeamStore = defineStore('team', {
  state: (): TeamState => ({
    myTeams: [],
    currentTeamId: null,
    pendingTeams: [],
  }),

  getters: {
    currentTeam: (state) => {
      return state.myTeams.find(team => team.id === state.currentTeamId) || null
    },
  },

  actions: {
    // 设置我的团队列表（合并已有的本地团队）
    setMyTeams(teams: Team[]) {
      // 保存已有的本地团队ID（用于去重）
      const existingIds = new Set(this.myTeams.map(t => t.id))
      
      // 合并数据：API返回的团队 + 本地添加的团队
      const mergedTeams = [
        ...teams.map(team => ({
          ...team,
          id: team.teamId || team.id,
          name: team.teamName || team.name,
        })),
        ...this.myTeams // 保留本地添加的团队
      ]
      
      // 去重（API返回的数据优先）
      const uniqueTeams = mergedTeams.reduce((acc, team) => {
        if (!acc.some(t => t.id === team.id)) {
          acc.push(team)
        }
        return acc
      }, [] as typeof mergedTeams)
      
      this.myTeams = uniqueTeams
      
      // 如果没有当前团队且有团队列表，设置第一个为当前团队
      if (!this.currentTeamId && this.myTeams.length > 0) {
        this.currentTeamId = this.myTeams[0].id
      }
    },

    // 设置待加入团队列表
    setPendingTeams(teams: Team[]) {
      this.pendingTeams = teams.map(team => ({
        ...team,
        id: team.teamId || team.id,
        name: team.teamName || team.name,
      }))
    },

    setCurrentTeam(teamId: string) {
      if (this.myTeams.some(team => team.id === teamId)) {
        this.currentTeamId = teamId
      }
    },

    addMyTeam(team: Team) {
      const teamData = {
        ...team,
        id: team.teamId || team.id,
        name: team.teamName || team.name,
      }
      // 检查是否已存在
      if (!this.myTeams.some(t => t.id === teamData.id)) {
        this.myTeams.push(teamData)
      }
      // 自动切换到新创建的团队
      this.currentTeamId = teamData.id
    },

    removeMyTeam(teamId: string) {
      const index = this.myTeams.findIndex(team => team.id === teamId)
      if (index !== -1) {
        this.myTeams.splice(index, 1)
        // 如果删除的是当前团队，切换到第一个团队
        if (this.currentTeamId === teamId && this.myTeams.length > 0) {
          this.currentTeamId = this.myTeams[0].id
        } else if (this.myTeams.length === 0) {
          this.currentTeamId = null
        }
      }
    },

    addPendingTeam(team: Team) {
      const teamData = {
        ...team,
        id: team.teamId || team.id,
        name: team.teamName || team.name,
      }
      if (!this.pendingTeams.some(t => t.id === teamData.id)) {
        this.pendingTeams.push(teamData)
      }
    },

    removePendingTeam(teamId: string) {
      const index = this.pendingTeams.findIndex(team => team.id === teamId)
      if (index !== -1) {
        this.pendingTeams.splice(index, 1)
      }
    },

    // 加入待加入的团队
    joinTeam(teamId: string) {
      const team = this.pendingTeams.find(t => t.id === teamId)
      if (team) {
        this.removePendingTeam(teamId)
        this.addMyTeam(team)
      }
    },

    // 更新团队名称
    updateTeamName(teamId: string, name: string) {
      const team = this.myTeams.find(t => t.id === teamId)
      if (team) {
        team.name = name
      }
    },
  },
})
