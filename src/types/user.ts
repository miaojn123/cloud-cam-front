/** 顶栏等场景展示的登录用户摘要（与 store 完整用户对象字段可不完全一致） */
export interface UserSummary {
  userName: string
  nickName: string
  /** 头像 URL；空则顶栏用灰底首字 SVG */
  avatar?: string
}
