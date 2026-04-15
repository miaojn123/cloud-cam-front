<template>
  <div class="user-nav-menu">
    <el-dropdown @command="handleCommand">
      <el-button
        class="el-button el-tooltip__trigger base-btn--ghost base-btn--ghost--no-frame"
        :style="{ height: '40px', color: 'white' }"
      >
        <span>
          <div class="user-trigger">
            <span class="el-avatar el-avatar--circle user-trigger__avatar">
              <img :src="resolvedAvatarSrc" alt="" style="object-fit: cover" />
            </span>
            <span class="user-trigger__name">{{ displayName }}</span>
            <i class="el-icon user-trigger__chevron" style="font-size: 16px; color: white">
              <el-icon :size="16"><ArrowDownBold /></el-icon>
            </i>
          </div>
        </span>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu style="width: 160px">
          <el-dropdown-item command="userInfo">用户信息</el-dropdown-item>
          <el-dropdown-item command="team">管理团队</el-dropdown-item>
          <el-dropdown-item command="feedback">问题反馈</el-dropdown-item>
          <el-dropdown-item command="help">帮助文档</el-dropdown-item>
          <el-dropdown-item command="logout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script lang="ts">
import type { PropType } from 'vue'
import { buildDefaultAvatarSvgDataUrl, getNicknameInitialLetter } from '@/utils/defaultAvatar'
import type { UserSummary } from '@/types/user'

/** 顶栏小头像用略大图生成，缩放到 24px 显示更清晰 */
const NAV_AVATAR_SVG_SIZE = 48

export default {
  name: 'UserNavMenu',
  props: {
    user: {
      type: Object as PropType<UserSummary | null>,
      default: null,
    },
  },
  emits: ['command'],
  computed: {
    displayName(): string {
      const u = this.user
      if (!u) return '未登录'
      const nick = String(u.nickName ?? '').trim()
      const un = String(u.userName ?? '').trim()
      return nick || un || '用户'
    },
    /** 有有效头像地址则用图，否则灰底首字 SVG（与资料页一致） */
    resolvedAvatarSrc(): string {
      const u = this.user
      if (!u) return buildDefaultAvatarSvgDataUrl('?', NAV_AVATAR_SVG_SIZE)
      const raw = typeof u.avatar === 'string' ? u.avatar.trim() : ''
      if (raw) return raw
      return buildDefaultAvatarSvgDataUrl(
        getNicknameInitialLetter(u.nickName, u.userName),
        NAV_AVATAR_SVG_SIZE
      )
    },
  },
  methods: {
    handleCommand(cmd: string) {
      this.$emit('command', cmd)
    },
  },
}
</script>

<style scoped>
.user-nav-menu {
  display: flex;
  align-items: center;
  gap: 8px;
}

.base-btn--ghost {
  background: transparent !important;
  border: none !important;
  color: #ffffff !important;
}

.base-btn--ghost:hover,
.base-btn--ghost:focus,
.base-btn--ghost:focus-visible {
  background: transparent !important;
}

.base-btn--ghost.base-btn--ghost--hover:hover {
  background: rgba(255, 255, 255, 0.08) !important;
}

.base-btn--ghost--no-frame,
.base-btn--ghost--no-frame:hover,
.base-btn--ghost--no-frame:focus,
.base-btn--ghost--no-frame:focus-visible {
  outline: none !important;
  box-shadow: none !important;
}

.base-btn--ghost--no-frame::before,
.base-btn--ghost--no-frame:hover::before,
.base-btn--ghost--no-frame:focus::before,
.base-btn--ghost--no-frame:focus-visible::before {
  display: none !important;
}

.user-trigger {
  display: flex;
  align-items: center;
  text-align: center;
  gap: 8px;
  height: 40px;
}

.user-trigger__avatar {
  width: 24px;
  height: 24px;
  border: 1px solid #ffffff;
  flex: 0 0 24px;
}

.user-trigger__name {
  width: 96px;
  flex: 0 0 96px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 16px;
  height: 24px;
  line-height: 24px;
}

.user-trigger__chevron {
  display: inline-flex;
  align-items: center;
}
</style>
