import { request } from './request'
import type { AxiosRequestConfig } from 'axios'

type TeamRequestConfig = AxiosRequestConfig & {
  _skipAuthRedirect?: boolean
}

const TEAM_BASE = '/team'

function postTeamApi<TResponse = unknown, TPayload = unknown>(
  path: string,
  payload?: TPayload,
  config?: TeamRequestConfig
) {
  return request<TResponse>({
    url: `${TEAM_BASE}${path}`,
    method: 'post',
    ...(payload === undefined ? {} : { data: payload }),
    ...config
  })
}

// ==================== 团队相关接口 ====================

export type CheckUsernameRequest = {
  userName: string
}

export function checkUsernameExistApi(userName: string) {
  return postTeamApi('/checkUsernameExist', { userName })
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

export function getPendingMembersApi(data: GetPendingMembersRequest) {
  return postTeamApi<GetPendingMembersResponse>('/getPendingMembers', data)
}

export type InviteMemberRequest = {
  teamUuid: string
  inviteeUserUuid: string
}

export function inviteMemberApi(data: InviteMemberRequest) {
  return postTeamApi('/addInvite', data)
}

export type UpdateMemberRoleRequest = {
  teamUuid: string
  userUuid: string
  role: number  // 1: 管理员, 0: 成员
}

export function updateMemberRoleApi(data: UpdateMemberRoleRequest) {
  return postTeamApi('/updateUserTeamRole', data)
}

export type RemoveMemberRequest = {
  teamUuid: string
  userUuid: string
}

export function removeMemberApi(data: RemoveMemberRequest) {
  return postTeamApi('/deleteUserFromTeam', data)
}

export type ReviewMemberRequest = {
  inviteUuid: string
  status: number  // 1: 同意, 0: 拒绝
}

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

export function getTeamSettingsApi(data: GetTeamSettingsRequest) {
  return postTeamApi<GetTeamSettingsResponse>('/getTeamSettings', data)
}

export type UpdateTeamSettingsRequest = {
  teamId: string
  allowShare?: boolean
  inviteMethod?: 'admin' | 'all' | 'link'
}

export function updateTeamSettingsApi(data: UpdateTeamSettingsRequest) {
  return postTeamApi('/updateTeamSettings', data)
}

// ==================== 加入/切换团队相关接口 ====================

export type JoinTeamRequest = {
  teamId: string
}

export function joinTeamApi(data: JoinTeamRequest) {
  return postTeamApi('/joinTeam', data)
}

export type SwitchTeamRequest = {
  teamId: string
}

export function switchTeamApi(data: SwitchTeamRequest) {
  return postTeamApi('/switchTeam', data)
}

export type ExitTeamRequest = {
  teamUuid: string
}

export function exitTeamApi(data: ExitTeamRequest) {
  return postTeamApi('/exitTeam', data)
}

export type TransferTeamRequest = {
  teamUuid: string
  userUuid: string
}

export function transferTeamApi(data: TransferTeamRequest) {
  return postTeamApi('/transferTeam', data)
}

export type DeleteTeamRequest = {
  teamUuid: string
}

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

export function getReceivedInviteApi() {
  return postTeamApi<GetReceivedInviteResponse>('/getReceivedInvite')
}
