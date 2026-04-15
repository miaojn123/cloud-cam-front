import {
  getTeamMembersApi,
  getPendingMembersApi,
  inviteMemberApi,
  updateMemberRoleApi,
  removeMemberApi,
  reviewMemberApi,
  type TeamMember,
  type PendingMember,
  type InviteMemberRequest,
  type UpdateMemberRoleRequest,
  type RemoveMemberRequest,
  type ReviewMemberRequest,
} from '@/api/team'

export type { TeamMember, PendingMember }
export type { InviteMemberRequest, UpdateMemberRoleRequest, RemoveMemberRequest, ReviewMemberRequest }

/** 团队成员相关流程。 */
export function useTeamMembers() {
  return {
    /** 获取团队成员列表。 */
    async fetchMembers(teamUuid: string): Promise<TeamMember[]> {
      const result = await getTeamMembersApi({ teamUuid })
      return result.data?.members || []
    },

    /** 获取待加入成员列表。 */
    async fetchPendingMembers(teamId: string): Promise<PendingMember[]> {
      const result = await getPendingMembersApi({ teamId })
      return result.data?.pendingMembers || []
    },

    /** 邀请成员。 */
    inviteMember(data: InviteMemberRequest) {
      return inviteMemberApi(data)
    },

    /** 更新成员角色。 */
    updateMemberRole(data: UpdateMemberRoleRequest) {
      return updateMemberRoleApi(data)
    },

    /** 移除成员。 */
    removeMember(data: RemoveMemberRequest) {
      return removeMemberApi(data)
    },

    /** 审核成员加入（同意/拒绝）。 */
    reviewMember(data: ReviewMemberRequest) {
      return reviewMemberApi(data)
    },
  }
}
