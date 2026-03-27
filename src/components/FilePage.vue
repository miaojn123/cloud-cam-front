<script lang="ts">
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores'

export default {
  name: 'FilePage',
  data() {
    return {
      loading: false
    }
  },
  computed: {
    appStore() {
      return useUserStore()
    },
    user() {
      return this.appStore.currentUser
    }
  },
  async mounted() {
    if (!this.user) {
      this.loading = true
      try {
        await this.appStore.fetchCurrentUser()
      } catch {
        ElMessage.error('获取用户信息失败')
      } finally {
        this.loading = false
      }
    }
  },
  methods: {
    async handleLogout() {
      this.loading = true
      try {
        await this.appStore.logout()
        ElMessage.success('退出成功')
      } catch {
        ElMessage.error('退出失败')
      } finally {
        this.loading = false
        this.$router.push('/login')
      }
    }
  }
}
</script>

<template>
  <div class="file-page">
    <div class="toolbar">
      <h2>FilePage</h2>
      <el-button type="danger" :loading="loading" @click="handleLogout">登出</el-button>
    </div>

    <div class="user-panel">
      <h3>当前用户信息</h3>
      <el-descriptions v-if="user" :column="1" border>
        <el-descriptions-item label="用户ID">{{ user.uuid }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ user.userName }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ user.nickName }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ user.email || '-' }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ user.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ user.createdAt }}</el-descriptions-item>
      </el-descriptions>
      <el-empty v-else description="暂无用户信息" />
    </div>
  </div>
</template>

<style scoped>
.file-page {
  min-height: 100vh;
  background: #fff;
  padding: 24px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.toolbar h2 {
  margin: 0;
}

.user-panel {
  max-width: 720px;
}

.user-panel h3 {
  margin: 0 0 12px;
  font-size: 16px;
}
</style>
