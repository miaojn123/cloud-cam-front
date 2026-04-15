import {
  getJoinTeamApi,
  createTeamApi,
  joinTeamApi,
  switchTeamApi,
  exitTeamApi,
  deleteTeamApi,
  updateTeamApi,
  getTeamSettingsApi,
  updateTeamSettingsApi,
  type CreateTeamRequest,
  type UpdateTeamRequest,
  type UpdateTeamSettingsRequest,
  type JoinedTeam,
  type PendingTeam,
  type TeamSettings,
} from '@/api/team'

export { type CreateTeamRequest, type UpdateTeamRequest, type UpdateTeamSettingsRequest }
export type { JoinedTeam, PendingTeam, TeamSettings }

/** 团队列表相关流程。 */
export function useTeamList() {
  return {
    /** 获取已加入和待加入的团队列表。 */
    async fetchTeams(): Promise<{ myTeams: JoinedTeam[], pendingTeams: PendingTeam[] }> {
      const result = await getJoinTeamApi()
      return result.data || { myTeams: [], pendingTeams: [] }
    },

    /** 创建团队。 */
    createTeam(data: CreateTeamRequest) {
      return createTeamApi(data)
    },

    /** 加入团队。 */
    joinTeam(teamId: string) {
      return joinTeamApi({ teamId })
    },

    /** 切换当前团队。 */
    switchTeam(teamId: string) {
      return switchTeamApi({ teamId })
    },

    /** 退出团队。 */
    exitTeam(teamUuid: string) {
      return exitTeamApi({ teamUuid })
    },

    /** 解散团队。 */
    deleteTeam(teamUuid: string) {
      return deleteTeamApi({ teamUuid })
    },

    /** 更新团队信息。 */
    updateTeam(data: UpdateTeamRequest) {
      return updateTeamApi(data)
    },
  }
}

/** 团队设置相关流程。 */
export function useTeamSettings() {
  return {
    /** 获取团队设置。 */
    async fetchSettings(teamId: string): Promise<TeamSettings | null> {
      const result = await getTeamSettingsApi({ teamId })
      return result.data?.settings || null
    },

    /** 更新团队设置。 */
    updateSettings(data: UpdateTeamSettingsRequest) {
      return updateTeamSettingsApi(data)
    },
  }
}
