<!-- src/views/Profile/index.vue -->
<template>
  <div class="profile-container">
    <el-card>
      <template #header>
        <h2>个人中心</h2>
      </template>
      
      <el-descriptions :column="2" border>
        <el-descriptions-item label="用户名">
          {{ authStore.user?.username }}
        </el-descriptions-item>
        <el-descriptions-item label="姓名">
          {{ authStore.user?.name }}
        </el-descriptions-item>
        <el-descriptions-item label="邮箱">
          {{ authStore.user?.email || '未设置' }}
        </el-descriptions-item>
        <el-descriptions-item label="注册时间">
          {{ authStore.user?.createTime || '未设置' }}
        </el-descriptions-item>
      </el-descriptions>

      <div class="user-stats">
        <h3>统计信息</h3>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="stat-item">
              <p class="stat-value">0</p>
              <p class="stat-label">已解决</p>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-item">
              <p class="stat-value">0</p>
              <p class="stat-label">总提交</p>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-item">
              <p class="stat-value">0%</p>
              <p class="stat-label">通过率</p>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<style scoped lang="scss">
.profile-container {
  width: 100%;
  padding: 20px;

  .user-stats {
    margin-top: 30px;

    h3 {
      margin-bottom: 20px;
      color: #303133;
    }

    .stat-item {
      text-align: center;
      padding: 20px;
      background-color: #f5f7fa;
      border-radius: 4px;

      .stat-value {
        font-size: 32px;
        font-weight: bold;
        color: #409eff;
        margin: 0 0 10px 0;
      }

      .stat-label {
        font-size: 14px;
        color: #606266;
        margin: 0;
      }
    }
  }
}
</style>
