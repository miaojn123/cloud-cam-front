import { getCurrentUserApi } from '@/api/user'
import type { CurrentUser } from '@/types/user'

export type FetchCurrentUserOptions = {
    skipAuthRedirect?: boolean
}

/** 当前登录用户信息相关流程。 */
export function useCurrentUser() {
    return {
        /** 拉取当前登录用户信息。 */
        async fetchCurrentUser(options?: FetchCurrentUserOptions) {
            const result = await getCurrentUserApi({
                _skipAuthRedirect: options?.skipAuthRedirect
            })
            return result.data?.user || null as CurrentUser | null
        }
    }
}
