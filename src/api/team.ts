import http, { type AjaxResult } from '@/utils/http'
import type { AxiosRequestConfig } from 'axios'

type TeamRequestConfig = AxiosRequestConfig & {
  _skipAuthRedirect?: boolean
}

const TEAM_BASE = '/api/team'

/** 统一发送团队模块 POST 请求。 */
function postTeamApi<TResponse = unknown, TPayload = unknown>(
  path: string,
  payload?: TPayload,
  config?: TeamRequestConfig
) {
  return http({
    url: `${TEAM_BASE}${path}`,
    method: 'post',
    ...(payload === undefined ? {} : { data: payload }),
    ...config
  }) as Promise<AjaxResult<TResponse>>
}

// ==================== 团队相关接口 ====================

export type CheckUsernameRequest = {
  userName: string
}

/** 检查用户名是否已存在。 */
export function checkUsernameExistApi(request: CheckUsernameRequest) {
  return postTeamApi('/checkUsernameExist', request)
}

export type CreateTeamRequest = {
  teamName: string
  region?: string
  industry?: string
}

export interface TeamInfo {
  teamId: string
  teamName: string
  description?: string
  region?: string
  industry?: string
  email?: string
  createTime?: string
}

export type CreateTeamResponse = {
  teamUuid: string
  teamName: string
  ownerUuid: string
  company?: string
  region?: string
  industry?: string
  createTime?: string
}

/** 创建团队。 */
export function createTeamApi(data: CreateTeamRequest) {
  return postTeamApi<CreateTeamResponse>('/createTeam', data)
}

export type JoinedTeam = {
  teamId: string
  teamName: string
  description?: string
  region?: string
  industry?: string
  email?: string
  role: 'owner' | 'admin' | 'member'
  joinedAt: string
}

export type PendingTeam = {
  teamId: string
  teamName: string
  inviterName: string
  invitedAt: string
  status: 'pending' | 'reviewing'
}

export type GetJoinTeamResponse = {
  myTeams: JoinedTeam[]
  pendingTeams: PendingTeam[]
}

/** 获取当前用户已加入/待加入团队。 */
export function getJoinTeamApi() {
  return postTeamApi<GetJoinTeamResponse>('/getJoinTeam')
}

export type UpdateTeamRequest = {
  teamId: string
  teamName?: string
  description?: string
  region?: string
  industry?: string
  email?: string
}

/** 更新团队基础信息。 */
export function updateTeamApi(data: UpdateTeamRequest) {
  return postTeamApi('/updateTeam', data)
}

// ==================== 成员相关接口 ====================

export type TeamMember = {
  userId: string
  userName: string
  nickName: string
  email: string | null
  avatar: string
  role: 'owner' | 'admin' | 'member'
  joinedAt: string
}

export type GetTeamMembersRequest = {
  teamUuid: string
}

export type GetTeamMembersResponse = {
  members: TeamMember[]
}

/** 获取团队成员列表。 */
export function getTeamMembersApi(data: GetTeamMembersRequest) {
  return postTeamApi<GetTeamMembersResponse>('/getTeamMember', data)
}

export type PendingMember = {
  userId: string
  userName: string
  nickName: string
  email: string | null
  avatar: string
  status: 'pending' | 'reviewing'
  inviterName: string
  invitedAt: string
}

export type GetPendingMembersRequest = {
  teamId: string
}

export type GetPendingMembersResponse = {
  pendingMembers: PendingMember[]
}

/** 获取待审核成员列表。 */
export function getPendingMembersApi(data: GetPendingMembersRequest) {
  return postTeamApi<GetPendingMembersResponse>('/getPendingMembers', data)
}

export type InviteMemberRequest = {
  teamUuid: string
  inviteeUserUuid: string
}

/** 邀请成员加入团队。 */
export function inviteMemberApi(data: InviteMemberRequest) {
  return postTeamApi('/addInvite', data)
}

export type UpdateMemberRoleRequest = {
  teamUuid: string
  userUuid: string
  role: number  // 1: 管理员, 0: 成员
}

/** 更新团队成员角色。 */
export function updateMemberRoleApi(data: UpdateMemberRoleRequest) {
  return postTeamApi('/updateUserTeamRole', data)
}

export type RemoveMemberRequest = {
  teamUuid: string
  userUuid: string
}

/** 移除团队成员。 */
export function removeMemberApi(data: RemoveMemberRequest) {
  return postTeamApi('/deleteUserFromTeam', data)
}

export type ReviewMemberRequest = {
  inviteUuid: string
  status: number  // 1: 同意, 0: 拒绝
}

/** 审核邀请成员请求。 */
export function reviewMemberApi(data: ReviewMemberRequest) {
  return postTeamApi('/updateInvite', data)
}

// ==================== 团队设置相关接口 ====================

export type TeamSettings = {
  teamId: string
  teamName: string
  allowShare: boolean
  inviteMethod: 'admin' | 'all' | 'link'
}

export type GetTeamSettingsRequest = {
  teamId: string
}

export type GetTeamSettingsResponse = {
  settings: TeamSettings
}

/** 获取团队设置。 */
export function getTeamSettingsApi(data: GetTeamSettingsRequest) {
  return postTeamApi<GetTeamSettingsResponse>('/getTeamSettings', data)
}

export type UpdateTeamSettingsRequest = {
  teamId: string
  allowShare?: boolean
  inviteMethod?: 'admin' | 'all' | 'link'
}

/** 更新团队设置。 */
export function updateTeamSettingsApi(data: UpdateTeamSettingsRequest) {
  return postTeamApi('/updateTeamSettings', data)
}

// ==================== 加入/切换团队相关接口 ====================

export type JoinTeamRequest = {
  teamId: string
}

/** 申请加入团队。 */
export function joinTeamApi(data: JoinTeamRequest) {
  return postTeamApi('/joinTeam', data)
}

export type SwitchTeamRequest = {
  teamId: string
}

/** 切换当前团队。 */
export function switchTeamApi(data: SwitchTeamRequest) {
  return postTeamApi('/switchTeam', data)
}

export type ExitTeamRequest = {
  teamUuid: string
}

/** 退出团队。 */
export function exitTeamApi(data: ExitTeamRequest) {
  return postTeamApi('/exitTeam', data)
}

export type TransferTeamRequest = {
  teamUuid: string
  userUuid: string
}

/** 转移团队所有权。 */
export function transferTeamApi(data: TransferTeamRequest) {
  return postTeamApi('/transferTeam', data)
}

export type DeleteTeamRequest = {
  teamUuid: string
}

/** 删除团队。 */
export function deleteTeamApi(data: DeleteTeamRequest) {
  return postTeamApi('/deleteTeam', data)
}

export type ReceivedInvite = {
  teamId: string
  teamName: string
  inviterName: string
  invitedAt: string
  status: 'pending' | 'reviewing'
}

export type GetReceivedInviteResponse = {
  invites: ReceivedInvite[]
}

/** 获取收到的团队邀请。 */
export function getReceivedInviteApi() {
  return postTeamApi<GetReceivedInviteResponse>('/getReceivedInvite')
}
