<!-- src/views/LearningPath/index.vue -->
<template>
  <div class="learning-path-container">
    <!-- 加载状态 -->
    <div v-if="store.loading" class="loading-state">
      <el-skeleton animated>
        <template #template>
          <div class="skeleton-header">
            <el-skeleton-item variant="h1" style="width: 40%" />
            <el-skeleton-item variant="text" style="width: 60%; margin-top: 16px" />
          </div>
          <div class="skeleton-steps">
            <el-skeleton-item
              v-for="i in 3"
              :key="i"
              variant="text"
              style="width: 80%; margin-top: 12px"
            />
          </div>
          <div class="skeleton-cards">
            <el-skeleton-item
              v-for="i in 4"
              :key="i"
              variant="rect"
              style="width: 100%; height: 120px; margin-top: 16px; border-radius: 12px"
            />
          </div>
        </template>
      </el-skeleton>
    </div>

    <!-- 错误或空推荐 -->
    <template v-else-if="!store.loading && (!store.recommendation || store.recommendation.recommendations.length === 0)">
      <div class="empty-state">
        <div class="empty-card">
          <div class="empty-icon-wrapper">
            <el-icon class="empty-icon"><MagicStick /></el-icon>
          </div>
          <h2>暂无推荐题目</h2>
          <p class="empty-desc">
            {{ store.error ? '推荐服务暂时不可用，请稍后再试' : '暂时没有可推荐题目，请先浏览题库或稍后再试' }}
          </p>
          <div class="empty-actions">
            <el-button type="primary" size="large" round @click="router.push('/problems')">
              <el-icon><Collection /></el-icon>
              <span>浏览题库</span>
            </el-button>
            <el-button size="large" round @click="handleRefresh">
              <el-icon><Refresh /></el-icon>
              <span>重新获取</span>
            </el-button>
          </div>
        </div>
      </div>
    </template>

    <!-- 正常推荐内容 -->
    <template v-else-if="store.recommendation">
      <div class="recommend-content">
        <!-- ===== 顶部标题区 ===== -->
        <div class="title-section">
          <div class="title-main">
            <h1>
              <span class="title-gradient">为你推荐</span>
            </h1>
            <div class="title-badges">
              <el-tag
                v-if="store.recommendation.source === 'LLM'"
                type="primary"
                effect="dark"
                size="large"
                class="ai-badge"
              >
                <el-icon><Cpu /></el-icon>
                AI 推荐
              </el-tag>
              <el-tag
                v-else-if="store.recommendation.source === 'STATIC_FALLBACK'"
                type="info"
                size="large"
                class="fallback-badge"
              >
                基础推荐
              </el-tag>
            </div>
          </div>
          <p class="title-subtitle">根据你的练习记录，智能推荐最适合当前阶段的题目</p>
        </div>

        <!-- ===== Summary 区域 ===== -->
        <div class="summary-card">
          <div class="summary-icon">
            <el-icon><Opportunity /></el-icon>
          </div>
          <div class="summary-body">
            <p class="summary-text">{{ store.recommendation.summary }}</p>
            <!-- 薄弱标签 -->
            <div v-if="store.hasValidWeakTags" class="weak-tags">
              <span class="weak-tags-label">薄弱领域：</span>
              <el-tag
                v-for="(tag, idx) in store.filteredWeakTags"
                :key="idx"
                :type="weakTagType(idx)"
                effect="plain"
                size="default"
                class="weak-tag-item"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>
        </div>

        <!-- ===== 学习路径区域 ===== -->
        <div class="learning-path-section">
          <h3 class="section-title">
            <el-icon><Guide /></el-icon>
            学习路径建议
          </h3>
          <div class="path-steps">
            <div
              v-for="(step, idx) in store.recommendation.learningPath"
              :key="idx"
              class="path-step"
            >
              <div class="step-marker">
                <div class="step-dot">{{ idx + 1 }}</div>
                <div v-if="idx < store.recommendation.learningPath.length - 1" class="step-line"></div>
              </div>
              <div class="step-content">
                <p>{{ step }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== 推荐题目列表 ===== -->
        <div class="recommend-list-section">
          <h3 class="section-title">
            <el-icon><Notebook /></el-icon>
            推荐题目
            <span class="section-count">共 {{ store.recommendation.recommendations.length }} 题</span>
          </h3>
          <div class="problem-cards">
            <div
              v-for="problem in store.recommendation.recommendations"
              :key="problem.problemId"
              class="problem-card"
              @click="handleGoProblem(problem.problemId)"
            >
              <div class="problem-card-left">
                <div class="problem-header">
                  <span class="problem-id">#{{ problem.problemId }}</span>
                  <el-tag
                    :type="getDifficultyType(problem.difficulty)"
                    size="small"
                    effect="dark"
                  >
                    {{ problem.difficultyDesc }}
                  </el-tag>
                  <span class="problem-priority" v-if="problem.priority <= 3">
                    <el-icon><Top /></el-icon>
                    优先 {{ problem.priority }}
                  </span>
                </div>
                <h4 class="problem-title-text">{{ problem.title }}</h4>
                <div class="problem-tags">
                  <el-tag
                    v-for="(tag, tIdx) in problem.tags"
                    :key="tIdx"
                    size="small"
                    class="problem-tag-item"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
                <div class="problem-reason">
                  <el-icon><ChatLineSquare /></el-icon>
                  <span>{{ problem.reason }}</span>
                </div>
              </div>
              <div class="problem-card-right">
                <div class="problem-stats">
                  <div class="stat-accept-rate">
                    <span class="stat-value">{{ formatAcceptRate(problem.acceptRate) }}</span>
                    <span class="stat-label">通过率</span>
                  </div>
                </div>
                <el-button type="primary" size="default" round class="go-btn">
                  去做题
                  <el-icon><Right /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  MagicStick, Collection, Refresh, Cpu, Opportunity, Guide, Notebook,
  Top, ChatLineSquare, Right
} from '@element-plus/icons-vue'
import { useLearningPathStore } from '@/stores/learningPath'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const store = useLearningPathStore()
const authStore = useAuthStore()

const handleRefresh = () => {
  store.fetchRecommendations(4)
}

const handleGoProblem = (problemId: string) => {
  router.push(`/problem/${problemId}`)
}

const getDifficultyType = (difficulty: number) => {
  const types: Record<number, string> = { 1: 'success', 2: 'warning', 3: 'danger' }
  return types[difficulty] || 'info'
}

const formatAcceptRate = (rate: number) => {
  return `${rate.toFixed(1)}%`
}

const weakTagColors = ['', 'warning', 'danger', 'primary', 'success']
const weakTagType = (idx: number) => {
  return weakTagColors[idx % weakTagColors.length]
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    store.fetchRecommendations(4)
  }
})
</script>

<style scoped lang="scss">
.learning-path-container {
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 20px;
}

// ===== 加载骨架 =====
.loading-state {
  .skeleton-header {
    margin-bottom: 32px;
  }
}

// ===== 空状态 =====
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;

  .empty-card {
    text-align: center;
    padding: 60px 48px;
    background: #fff;
    border-radius: 20px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);

    .empty-icon-wrapper {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 88px;
      height: 88px;
      border-radius: 50%;
      background: linear-gradient(135deg, #e8f0fe 0%, #f3e8ff 100%);
      margin-bottom: 24px;

      .empty-icon {
        font-size: 40px;
        color: #7c3aed;
      }
    }

    h2 {
      font-size: 24px;
      color: #303133;
      margin: 0 0 12px 0;
    }

    .empty-desc {
      font-size: 15px;
      color: #909399;
      margin: 0 0 28px 0;
      line-height: 1.6;
    }

    .empty-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
    }
  }
}

// ===== 推荐内容 =====
.recommend-content {
  // ===== 标题区 =====
  .title-section {
    text-align: center;
    padding: 40px 0 32px;

    .title-main {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      flex-wrap: wrap;

      h1 {
        margin: 0;
        font-size: 36px;
        font-weight: 800;

        .title-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      }

      .ai-badge {
        background: linear-gradient(135deg, #667eea, #764ba2);
        border-color: transparent;
        font-weight: 600;
        padding: 0 14px;
        height: 32px;
        line-height: 32px;
        letter-spacing: 0.5px;
      }

      .fallback-badge {
        font-weight: 500;
      }
    }

    .title-subtitle {
      margin: 12px 0 0;
      font-size: 15px;
      color: #909399;
    }
  }

  // ===== Summary 卡片 =====
  .summary-card {
    display: flex;
    gap: 16px;
    background: linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%);
    border: 1px solid #e8e0f0;
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 28px;

    .summary-icon {
      flex-shrink: 0;
      display: flex;
      align-items: flex-start;
      padding-top: 2px;

      .el-icon {
        font-size: 28px;
        color: #7c3aed;
      }
    }

    .summary-body {
      flex: 1;

      .summary-text {
        margin: 0;
        font-size: 15px;
        color: #4c4f6b;
        line-height: 1.8;
      }

      .weak-tags {
        margin-top: 14px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;

        .weak-tags-label {
          font-size: 13px;
          color: #909399;
          font-weight: 500;
        }

        .weak-tag-item {
          font-weight: 500;
          border-radius: 8px;
        }
      }
    }
  }

  // ===== Section 标题 =====
  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 20px;
    font-weight: 700;
    color: #303133;
    margin: 0 0 20px 0;

    .el-icon {
      color: #667eea;
      font-size: 22px;
    }

    .section-count {
      font-size: 13px;
      color: #909399;
      font-weight: 400;
      margin-left: auto;
    }
  }

  // ===== 学习路径步骤 =====
  .learning-path-section {
    margin-bottom: 36px;

    .path-steps {
      background: #fff;
      border-radius: 16px;
      padding: 20px 28px;
      box-shadow: 0 2px 16px rgba(0, 0, 0, 0.04);
    }

    .path-step {
      display: flex;
      gap: 16px;

      &:last-child .step-marker {
        padding-bottom: 0;
      }

      .step-marker {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-bottom: 16px;

        .step-dot {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .step-line {
          width: 2px;
          flex: 1;
          min-height: 28px;
          background: linear-gradient(to bottom, #d4c5f0, #e8e0f0);
          margin-top: 8px;
        }
      }

      .step-content {
        padding-top: 4px;
        padding-bottom: 16px;

        p {
          margin: 0;
          font-size: 15px;
          color: #4c4f6b;
          line-height: 1.7;
        }
      }
    }
  }

  // ===== 推荐题目列表 =====
  .recommend-list-section {
    .problem-cards {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .problem-card {
      display: flex;
      align-items: stretch;
      background: #fff;
      border-radius: 14px;
      padding: 20px 24px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
      border: 1px solid #f0f0f0;
      cursor: pointer;
      transition: all 0.25s ease;

      &:hover {
        border-color: #c4b5fd;
        box-shadow: 0 8px 28px rgba(102, 126, 234, 0.15);
        transform: translateY(-2px);

        .go-btn {
          transform: scale(1.05);
        }
      }

      .problem-card-left {
        flex: 1;
        min-width: 0;

        .problem-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;

          .problem-id {
            font-size: 13px;
            color: #a0aec0;
            font-family: 'JetBrains Mono', 'Fira Code', monospace;
            font-weight: 600;
          }

          .problem-priority {
            display: inline-flex;
            align-items: center;
            gap: 3px;
            font-size: 12px;
            color: #e6a23c;
            font-weight: 600;

            .el-icon {
              font-size: 14px;
            }
          }
        }

        .problem-title-text {
          margin: 0 0 10px 0;
          font-size: 17px;
          font-weight: 700;
          color: #1a202c;
          line-height: 1.3;
        }

        .problem-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 10px;

          .problem-tag-item {
            background: #f4f6fb;
            border-color: transparent;
            color: #4a5568;
            font-size: 12px;
            border-radius: 6px;
          }
        }

        .problem-reason {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          font-size: 13px;
          color: #718096;
          line-height: 1.5;

          .el-icon {
            flex-shrink: 0;
            margin-top: 2px;
            color: #a0aec0;
            font-size: 15px;
          }
        }
      }

      .problem-card-right {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 14px;
        padding-left: 24px;
        border-left: 1px solid #f0f0f0;
        margin-left: 20px;
        flex-shrink: 0;

        .problem-stats {
          text-align: center;

          .stat-accept-rate {
            .stat-value {
              display: block;
              font-size: 28px;
              font-weight: 800;
              color: #38a169;
              line-height: 1;
            }

            .stat-label {
              font-size: 12px;
              color: #a0aec0;
              margin-top: 4px;
              display: block;
            }
          }
        }

        .go-btn {
          transition: transform 0.25s ease;
        }
      }
    }
  }
}

// 响应式
@media (max-width: 768px) {
  .learning-path-container {
    padding: 16px 12px;
  }

  .recommend-content .title-section .title-main h1 {
    font-size: 26px;
  }

  .recommend-list-section .problem-card {
    flex-direction: column;

    .problem-card-right {
      flex-direction: row;
      justify-content: space-between;
      border-left: none;
      border-top: 1px solid #f0f0f0;
      padding-left: 0;
      margin-left: 0;
      padding-top: 14px;
      margin-top: 8px;

      .problem-stats {
        text-align: left;

        .stat-accept-rate {
          display: flex;
          align-items: center;
          gap: 8px;

          .stat-value {
            font-size: 22px;
          }
        }
      }
    }
  }
}
</style>
