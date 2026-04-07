/** 当前登录用户完整信息 */
export interface CurrentUser {
  uuid: string
  userName: string
  nickName: string
  email: string | null
  phone: string | null
  sex: number
  avatar: string
  organization?: string | null
  industry?: string | null
  role: number
  status: number
  lastLoginAt: string | null
  lastLoginIp: string | null
  createdAt: string
}

/** 顶栏等场景展示的登录用户摘要 */
export type UserSummary = Pick<CurrentUser, 'userName' | 'nickName' | 'avatar'>
