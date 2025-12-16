<!-- src/views/Home/index.vue -->
<template>
  <div class="home-container">
    <el-card class="welcome-card">
      <h1>欢迎来到 EmiyaOJ</h1>
      <p>一个功能强大的在线判题系统</p>
      <el-button type="primary" size="large" @click="router.push('/problems')">
        开始刷题
      </el-button>
    </el-card>

    <el-row :gutter="20" class="stats-row">
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#409eff"><Document /></el-icon>
            <div class="stat-text">
              <h3>题目总数</h3>
              <p class="stat-number">1000+</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#67c23a"><User /></el-icon>
            <div class="stat-text">
              <h3>用户数量</h3>
              <p class="stat-number">5000+</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#f56c6c"><TrendCharts /></el-icon>
            <div class="stat-text">
              <h3>每日提交</h3>
              <p class="stat-number">10000+</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="features-card">
      <h2>核心功能</h2>
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="feature-item">
            <h3>🎯 海量题库</h3>
            <p>涵盖算法、数据结构等多个领域，从简单到困难，满足不同水平的需求</p>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="feature-item">
            <h3>⚡ 实时判题</h3>
            <p>高效的判题系统，快速给出运行结果和性能反馈</p>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="feature-item">
            <h3>💻 多语言支持</h3>
            <p>支持Java、C++、Python等多种编程语言</p>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="feature-item">
            <h3>📊 详细统计</h3>
            <p>记录每一次提交，追踪进步历程</p>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Document, User, TrendCharts } from '@element-plus/icons-vue'

const router = useRouter()
</script>

<style scoped lang="scss">
.home-container {
  width: 100%;
  padding: 20px;

  .welcome-card {
    text-align: center;
    padding: 60px 20px;
    margin-bottom: 30px;

    h1 {
      font-size: 48px;
      margin-bottom: 20px;
      color: #409eff;
    }

    p {
      font-size: 20px;
      color: #606266;
      margin-bottom: 40px;
    }
  }

  .stats-row {
    margin-bottom: 30px;

    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        gap: 20px;

        .stat-icon {
          font-size: 48px;
        }

        .stat-text {
          h3 {
            margin: 0 0 10px 0;
            font-size: 16px;
            color: #606266;
          }

          .stat-number {
            margin: 0;
            font-size: 32px;
            font-weight: bold;
            color: #303133;
          }
        }
      }
    }
  }

  .features-card {
    h2 {
      text-align: center;
      margin-bottom: 40px;
      color: #303133;
    }

    .feature-item {
      padding: 20px;
      text-align: center;

      h3 {
        font-size: 20px;
        margin-bottom: 15px;
        color: #409eff;
      }

      p {
        color: #606266;
        line-height: 1.6;
      }
    }
  }
}
</style>
