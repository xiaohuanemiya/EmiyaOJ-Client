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

    <!-- 为你推荐模块（仅登录用户可见） -->
    <el-card v-if="authStore.isAuthenticated && !lpStore.loading && lpStore.recommendation && lpStore.recommendation.recommendations.length > 0" class="recommend-card">
      <template #header>
        <div class="recommend-header">
          <h2>
            <span class="recommend-title-gradient">为你推荐</span>
          </h2>
          <div class="recommend-header-right">
            <el-tag
              v-if="lpStore.recommendation.source === 'LLM'"
              type="primary"
              effect="dark"
              size="small"
              class="ai-badge-mini"
            >
              <el-icon><Cpu /></el-icon>
              AI 推荐
            </el-tag>
            <el-button text size="small" type="primary" @click="router.push('/recommend')">
              查看全部
              <el-icon><Right /></el-icon>
            </el-button>
          </div>
        </div>
      </template>

      <div class="recommend-summary">
        <el-icon class="summary-icon"><Opportunity /></el-icon>
        <span>{{ lpStore.recommendation.summary }}</span>
      </div>

      <div class="recommend-problems">
        <div
          v-for="problem in lpStore.recommendation.recommendations"
          :key="problem.problemId"
          class="recommend-item"
          @click="router.push(`/problem/${problem.problemId}`)"
        >
          <div class="recommend-item-left">
            <span class="rec-problem-id">#{{ problem.problemId }}</span>
            <el-tag
              :type="getDifficultyType(problem.difficulty)"
              size="small"
              effect="dark"
            >
              {{ problem.difficultyDesc }}
            </el-tag>
            <span class="rec-problem-title">{{ problem.title }}</span>
          </div>
          <div class="recommend-item-right">
            <span class="rec-accept-rate">{{ formatAcceptRate(problem.acceptRate) }}</span>
            <el-icon><Right /></el-icon>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Document, User, TrendCharts, Cpu, Opportunity, Right } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useLearningPathStore } from '@/stores/learningPath'

const router = useRouter()
const authStore = useAuthStore()
const lpStore = useLearningPathStore()

const getDifficultyType = (difficulty: number) => {
  const types: Record<number, string> = { 1: 'success', 2: 'warning', 3: 'danger' }
  return types[difficulty] || 'info'
}

const formatAcceptRate = (rate: number) => {
  return `${rate.toFixed(1)}%`
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    lpStore.fetchRecommendations(4)
  }
})
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

  // 推荐模块
  .recommend-card {
    margin-top: 30px;

    .recommend-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h2 {
        margin: 0;

        .recommend-title-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      }

      .recommend-header-right {
        display: flex;
        align-items: center;
        gap: 12px;

        .ai-badge-mini {
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-color: transparent;
          font-weight: 600;
        }
      }
    }

    .recommend-summary {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 16px 20px;
      background: linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%);
      border-radius: 12px;
      margin-bottom: 20px;
      font-size: 14px;
      color: #4c4f6b;
      line-height: 1.6;

      .summary-icon {
        flex-shrink: 0;
        font-size: 20px;
        color: #7c3aed;
        margin-top: 1px;
      }
    }

    .recommend-problems {
      display: flex;
      flex-direction: column;
      gap: 10px;

      .recommend-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 18px;
        background: #fafbfc;
        border-radius: 10px;
        cursor: pointer;
        border: 1px solid transparent;
        transition: all 0.2s ease;

        &:hover {
          background: #f0f4ff;
          border-color: #c4b5fd;
        }

        .recommend-item-left {
          display: flex;
          align-items: center;
          gap: 10px;

          .rec-problem-id {
            font-size: 13px;
            color: #a0aec0;
            font-family: monospace;
            font-weight: 600;
          }

          .rec-problem-title {
            font-size: 15px;
            font-weight: 600;
            color: #1a202c;
          }
        }

        .recommend-item-right {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #a0aec0;

          .rec-accept-rate {
            font-size: 18px;
            font-weight: 700;
            color: #38a169;
          }
        }
      }
    }
  }
}
</style>
