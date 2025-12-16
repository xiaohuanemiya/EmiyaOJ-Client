<!-- src/layouts/DefaultLayout.vue -->
<template>
  <div class="default-layout">
    <el-container>
      <el-header class="header">
        <div class="header-content">
          <div class="logo">
            <router-link to="/">
              <h1>EmiyaOJ</h1>
            </router-link>
          </div>
          <el-menu
            mode="horizontal"
            :default-active="activeMenu"
            class="nav-menu"
            router
          >
            <el-menu-item index="/">首页</el-menu-item>
            <el-menu-item index="/problems">题库</el-menu-item>
            <el-menu-item index="/submissions">提交记录</el-menu-item>
          </el-menu>
          <div class="user-actions">
            <template v-if="authStore.isAuthenticated">
              <el-dropdown @command="handleCommand">
                <span class="user-info">
                  <el-icon><User /></el-icon>
                  {{ authStore.username }}
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                    <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
            <template v-else>
              <el-button type="primary" @click="router.push('/login')">
                登录
              </el-button>
            </template>
          </div>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
      <el-footer class="footer">
        <p>&copy; 2024 EmiyaOJ. All rights reserved.</p>
      </el-footer>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { User } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const activeMenu = computed(() => route.path)

const handleCommand = (command: string) => {
  if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'logout') {
    authStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped lang="scss">
.default-layout {
  min-height: 100vh;
  background-color: #f5f7fa;

  .el-container {
    min-height: 100vh;
    flex-direction: column;
  }

  .header {
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 0;
    height: 60px;

    .header-content {
      max-width: 1600px;
      margin: 0 auto;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 40px;

      .logo {
        h1 {
          margin: 0;
          font-size: 24px;
          color: #409eff;
          cursor: pointer;
        }

        a {
          text-decoration: none;
        }
      }

      .nav-menu {
        flex: 1;
        margin-left: 40px;
        border-bottom: none;
      }

      .user-actions {
        .user-info {
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
        }
      }
    }
  }

  .main-content {
    max-width: 1600px;
    width: 100%;
    margin: 0 auto;
    padding: 30px 40px;
    flex: 1;
  }

  .footer {
    background-color: #fff;
    text-align: center;
    color: #909399;
    height: 60px;
    line-height: 60px;

    p {
      margin: 0;
    }
  }
}
</style>
