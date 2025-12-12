<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const userStore = useUserStore()

// 页面加载时恢复用户信息
onMounted(() => {
  userStore.restoreUserInfo()
})

const handleLogout = () => {
  userStore.logout()
}

const isLoginPage = () => {
  return route.path === '/login'
}
</script>

<template>
  <div id="app">
    <!-- 登录页不显示导航栏 -->
    <template v-if="!isLoginPage()">
      <el-container class="layout-container">
        <el-header class="header">
          <div class="header-content">
            <div class="logo">
              <h1>EmiyaOJ</h1>
            </div>
            <el-menu
              mode="horizontal"
              :default-active="route.path"
              router
              class="nav-menu"
            >
              <el-menu-item index="/problems">题目列表</el-menu-item>
              <el-menu-item index="/submissions">提交记录</el-menu-item>
            </el-menu>
            <div class="user-info">
              <span class="username">{{ userStore.userInfo?.name || userStore.userInfo?.username }}</span>
              <el-button type="danger" size="small" @click="handleLogout">退出</el-button>
            </div>
          </div>
        </el-header>
        <el-main class="main-content">
          <RouterView />
        </el-main>
      </el-container>
    </template>
    
    <!-- 登录页直接显示 -->
    <template v-else>
      <RouterView />
    </template>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  min-width: 1024px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

#app {
  display: flex;
  flex-direction: column;
}

.layout-container {
  height: 100%;
}

.header {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0 20px;
}

.header-content {
  display: flex;
  align-items: center;
  height: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.logo {
  margin-right: 40px;
}

.logo h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #409eff;
}

.nav-menu {
  flex: 1;
  border-bottom: none;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.username {
  color: #666;
  font-size: 14px;
}

.main-content {
  background-color: #f5f5f5;
  overflow-y: auto;
  padding: 20px;
}

.main-content > * {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
