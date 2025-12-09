<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Document, List, User } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const handleLogout = async () => {
  try {
    await userStore.logout()
    ElMessage.success('退出登录成功')
  } catch (error) {
    console.error('退出登录失败:', error)
  }
}

const goToProblems = () => {
  router.push('/problems')
}

const goToSubmissions = () => {
  router.push('/submissions')
}
</script>

<template>
  <el-container class="layout-container">
    <el-header class="layout-header">
      <div class="header-left">
        <h2>EmiyaOJ 在线评测系统</h2>
      </div>
      <div class="header-right">
        <el-menu
          mode="horizontal"
          :ellipsis="false"
          class="header-menu"
        >
          <el-menu-item index="1" @click="goToProblems">
            <el-icon><Document /></el-icon>
            题目列表
          </el-menu-item>
          <el-menu-item index="2" @click="goToSubmissions">
            <el-icon><List /></el-icon>
            提交记录
          </el-menu-item>
          <el-sub-menu index="3">
            <template #title>
              <el-icon><User /></el-icon>
              {{ userStore.userInfo?.name || userStore.userInfo?.username || '用户' }}
            </template>
            <el-menu-item @click="handleLogout">退出登录</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </div>
    </el-header>
    <el-main class="layout-main">
      <slot />
    </el-main>
  </el-container>
</template>

<style scoped>
.layout-container {
  min-height: 100vh;
}

.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 20px;
}

.header-left h2 {
  margin: 0;
  font-size: 20px;
  color: #409eff;
}

.header-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.header-menu {
  border-bottom: none;
}

.layout-main {
  background-color: #f5f7fa;
  padding: 20px;
}
</style>
