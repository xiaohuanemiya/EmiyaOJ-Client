<!-- src/views/Profile/index.vue -->
<template>
  <div class="profile-container">
    <el-card class="profile-overview" shadow="never">
      <div v-loading="profileLoading" class="overview-content">
        <div class="profile-header">
          <el-avatar
            :size="84"
            :src="profile?.user.avatar || undefined"
            class="profile-avatar"
          >
            {{ avatarText }}
          </el-avatar>

          <div class="profile-main">
            <div class="profile-title">
              <h2>{{ displayName }}</h2>
              <el-tag size="small" :type="isCurrentUser ? 'success' : 'info'">
                {{ isCurrentUser ? '我的主页' : '公开主页' }}
              </el-tag>
            </div>
            <div class="profile-meta">
              <span>
                <el-icon><User /></el-icon>
                @{{ profile?.user.username || targetUserId || '-' }}
              </span>
              <span>
                <el-icon><Calendar /></el-icon>
                {{ formatDate(profile?.user.createTime) }}
              </span>
            </div>
          </div>
        </div>

        <div class="stats-grid">
          <button class="stat-tile" type="button" @click="showTab('solved')">
            <span class="stat-value">{{ profile?.solvedCount || 0 }}</span>
            <span class="stat-label">已解决</span>
          </button>
          <div class="stat-tile">
            <span class="stat-value">{{ profile?.totalSubmitCount || 0 }}</span>
            <span class="stat-label">总提交</span>
          </div>
          <div class="stat-tile">
            <span class="stat-value">{{ profile?.acceptedSubmitCount || 0 }}</span>
            <span class="stat-label">AC 提交</span>
          </div>
          <div class="stat-tile">
            <span class="stat-value">{{ formatPassRate(profile?.passRate) }}</span>
            <span class="stat-label">通过率</span>
          </div>
          <button class="stat-tile" type="button" @click="showTab('blogs')">
            <span class="stat-value">{{ profile?.blogCount || 0 }}</span>
            <span class="stat-label">发布博客</span>
          </button>
          <button class="stat-tile" type="button" @click="showTab('stars')">
            <span class="stat-value">{{ profile?.starCount || 0 }}</span>
            <span class="stat-label">收藏博客</span>
          </button>
          <button class="stat-tile" type="button" @click="showTab('likes')">
            <span class="stat-value">{{ profile?.likedBlogCount || 0 }}</span>
            <span class="stat-label">点赞博客</span>
          </button>
        </div>

        <div class="difficulty-panel">
          <div
            v-for="item in difficultyItems"
            :key="item.difficulty"
            class="difficulty-item"
          >
            <div class="difficulty-head">
              <el-tag :type="getDifficultyType(item.difficulty)" size="small">
                {{ item.difficultyDesc }}
              </el-tag>
              <span>{{ item.solvedCount }} 题</span>
            </div>
            <el-progress
              :percentage="getDifficultyPercentage(item.solvedCount)"
              :stroke-width="8"
              :show-text="false"
            />
          </div>
        </div>
      </div>
    </el-card>

    <el-card class="profile-detail" shadow="never">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane name="solved">
          <template #label>
            <span class="tab-label">已解决 <span>{{ profile?.solvedCount || 0 }}</span></span>
          </template>

          <div class="table-toolbar">
            <el-radio-group v-model="solvedQuery.difficulty" @change="handleDifficultyChange">
              <el-radio-button :value="undefined">全部</el-radio-button>
              <el-radio-button :value="1">简单</el-radio-button>
              <el-radio-button :value="2">中等</el-radio-button>
              <el-radio-button :value="3">困难</el-radio-button>
            </el-radio-group>
          </div>

          <el-table
            v-loading="solvedLoading"
            :data="solvedProblems"
            class="solved-table"
            @row-click="handleProblemClick"
          >
            <el-table-column prop="problemId" label="题号" width="120" />
            <el-table-column prop="title" label="题目" min-width="220" />
            <el-table-column label="难度" width="120">
              <template #default="{ row }">
                <el-tag :type="getDifficultyType(row.difficulty)" size="small">
                  {{ row.difficultyDesc || getDifficultyDesc(row.difficulty) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="最早 AC 时间" width="190">
              <template #default="{ row }">
                {{ formatDate(row.acceptedAt) }}
              </template>
            </el-table-column>
          </el-table>

          <el-empty
            v-if="!solvedLoading && solvedProblems.length === 0"
            description="暂无已解决题目"
          />

          <div v-if="solvedTotal > 0" class="pagination-container">
            <el-pagination
              v-model:current-page="solvedQuery.pageNum"
              v-model:page-size="solvedQuery.pageSize"
              :total="solvedTotal"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              @current-change="fetchSolvedProblems"
              @size-change="handleSolvedSizeChange"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane name="blogs">
          <template #label>
            <span class="tab-label">发布博客 <span>{{ profile?.blogCount || 0 }}</span></span>
          </template>
          <div v-if="activeTab === 'blogs'" v-loading="blogStore.loading" class="blog-list">
            <BlogListContent
              :blogs="blogStore.userBlogs"
              empty-text="暂无发布的博客"
              @open-blog="handleBlogClick"
            />
            <BlogPagination
              :total="blogStore.userBlogsTotal"
              :page-no="blogQuery.pageNo"
              :page-size="blogQuery.pageSize"
              @page-change="handleBlogPageChange"
              @size-change="handleBlogSizeChange"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane name="stars">
          <template #label>
            <span class="tab-label">收藏博客 <span>{{ profile?.starCount || 0 }}</span></span>
          </template>
          <div v-if="activeTab === 'stars'" v-loading="blogStore.loading" class="blog-list">
            <BlogListContent
              :blogs="blogStore.userStarredBlogs"
              empty-text="暂无收藏的博客"
              @open-blog="handleBlogClick"
            />
            <BlogPagination
              :total="blogStore.userStarredTotal"
              :page-no="starQuery.pageNo"
              :page-size="starQuery.pageSize"
              @page-change="handleBlogPageChange"
              @size-change="handleBlogSizeChange"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane name="likes">
          <template #label>
            <span class="tab-label">点赞博客 <span>{{ profile?.likedBlogCount || 0 }}</span></span>
          </template>
          <div v-if="activeTab === 'likes'" v-loading="blogStore.loading" class="blog-list">
            <BlogListContent
              :blogs="blogStore.userLikedBlogs"
              empty-text="暂无点赞的博客"
              @open-blog="handleBlogClick"
            />
            <BlogPagination
              :total="blogStore.userLikedTotal"
              :page-no="likeQuery.pageNo"
              :page-size="likeQuery.pageSize"
              @page-change="handleBlogPageChange"
              @size-change="handleBlogSizeChange"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, reactive, ref, resolveComponent, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Calendar, Star, User, View } from '@element-plus/icons-vue'
import type { Component, PropType } from 'vue'
import type { Blog, UserBlogQueryParams, UserLikeQueryParams, UserStarQueryParams } from '@/types/blog'
import type {
  DifficultySolvedStatsVO,
  ProfileCenterVO,
  SolvedProblemQueryParams,
  SolvedProblemVO
} from '@/types/profile'
import { getMyProfileCenter, getUserProfileCenter, queryUserSolvedProblems } from '@/api/profile'
import { useAuthStore } from '@/stores/auth'
import { useBlogStore } from '@/stores/blog'
import { formatDateTime } from '@/utils/format'

type ProfileTab = 'solved' | 'blogs' | 'stars' | 'likes'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const blogStore = useBlogStore()

const profile = ref<ProfileCenterVO | null>(null)
const profileLoading = ref(false)
const solvedLoading = ref(false)
const solvedProblems = ref<SolvedProblemVO[]>([])
const solvedTotal = ref(0)
const activeTab = ref<ProfileTab>('solved')

const solvedQuery = reactive<SolvedProblemQueryParams>({
  pageNum: 1,
  pageSize: 10,
  difficulty: undefined
})

const blogQuery = reactive<UserBlogQueryParams>({
  pageNo: 1,
  pageSize: 10
})

const starQuery = reactive<UserStarQueryParams>({
  pageNo: 1,
  pageSize: 10
})

const likeQuery = reactive<UserLikeQueryParams>({
  pageNo: 1,
  pageSize: 10
})

const routeUserId = computed(() => {
  const value = route.params.userId
  return Array.isArray(value) ? value[0] : value
})

const isMyProfileRoute = computed(() => route.name === 'Profile')
const targetUserId = computed(() => {
  return isMyProfileRoute.value
    ? String(profile.value?.user.id || authStore.user?.id || '')
    : String(routeUserId.value || '')
})
const isCurrentUser = computed(() => !!authStore.user?.id && targetUserId.value === String(authStore.user.id))

const displayName = computed(() => {
  const user = profile.value?.user
  return user?.nickname?.trim() || user?.username || '用户'
})

const avatarText = computed(() => {
  const name = displayName.value.trim()
  return name ? name.charAt(0).toUpperCase() : 'U'
})

const difficultyItems = computed<DifficultySolvedStatsVO[]>(() => {
  const stats = profile.value?.difficultyStats || []
  return [1, 2, 3].map((difficulty) => {
    return stats.find((item) => Number(item.difficulty) === difficulty) || {
      difficulty,
      difficultyDesc: getDifficultyDesc(difficulty),
      solvedCount: 0
    }
  })
})

const currentBlogQuery = computed(() => {
  if (activeTab.value === 'stars') return starQuery
  if (activeTab.value === 'likes') return likeQuery
  return blogQuery
})

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '未设置'
  return formatDateTime(dateStr)
}

const formatPassRate = (value?: number) => {
  return `${Number(value || 0).toFixed(2)}%`
}

const getDifficultyDesc = (difficulty: number) => {
  const texts: Record<number, string> = { 1: '简单', 2: '中等', 3: '困难' }
  return texts[difficulty] || '未知'
}

const getDifficultyType = (difficulty: number) => {
  const types: Record<number, 'success' | 'warning' | 'danger' | 'info'> = {
    1: 'success',
    2: 'warning',
    3: 'danger'
  }
  return types[difficulty] || 'info'
}

const getDifficultyPercentage = (count: number) => {
  const total = profile.value?.solvedCount || 0
  if (total <= 0) return 0
  return Number(((count / total) * 100).toFixed(2))
}

const hasValidUserId = (userId?: string) => {
  return !!userId && userId !== 'undefined' && userId !== 'null'
}

const syncAuthUserFromProfile = (data: ProfileCenterVO) => {
  if (!isMyProfileRoute.value || !data.user.id) return

  const currentId = authStore.user?.id
  const profileUserId = String(data.user.id)

  // Skip if already synced with the same correct ID
  if (hasValidUserId(currentId) && String(currentId) === profileUserId) return

  // Sync to fix BigInt precision loss from JWT (e.g. 2051936325377880065 → 2051936325377880000)
  authStore.setUserInfo({
    id: data.user.id,
    username: data.user.username,
    nickname: data.user.nickname || data.user.username,
    avatar: data.user.avatar || undefined,
    createTime: data.user.createTime
  })
}

const resetQueries = () => {
  solvedQuery.pageNum = 1
  solvedQuery.pageSize = 10
  solvedQuery.difficulty = undefined
  blogQuery.pageNo = 1
  blogQuery.pageSize = 10
  starQuery.pageNo = 1
  starQuery.pageSize = 10
  likeQuery.pageNo = 1
  likeQuery.pageSize = 10
}

const fetchProfile = async (userId = targetUserId.value) => {
  const requestedUserId = String(userId || '')
  if (!isMyProfileRoute.value && !userId) return null

  profileLoading.value = true
  try {
    const response = isMyProfileRoute.value
      ? await getMyProfileCenter()
      : await getUserProfileCenter(requestedUserId)

    if (response.code === 200 && response.data && requestedUserId === targetUserId.value) {
      profile.value = response.data
      syncAuthUserFromProfile(response.data)
      return response.data
    }

    if (response.code === 200 && response.data && isMyProfileRoute.value) {
      profile.value = response.data
      syncAuthUserFromProfile(response.data)
      return response.data
    }

    return null
  } catch (error) {
    console.error('Failed to fetch profile center:', error)
    return null
  } finally {
    profileLoading.value = false
  }
}

const fetchSolvedProblems = async (resolvedUserId = targetUserId.value) => {
  const userId = String(resolvedUserId || '')
  if (!userId) return

  solvedLoading.value = true
  try {
    const response = await queryUserSolvedProblems(userId, solvedQuery)
    if (response.code === 200 && response.data && userId === targetUserId.value) {
      solvedProblems.value = response.data.list
      solvedTotal.value = response.data.total
    }
  } catch (error) {
    console.error('Failed to fetch solved problems:', error)
  } finally {
    solvedLoading.value = false
  }
}

const fetchCurrentBlogs = () => {
  const userId = String(targetUserId.value || '')
  if (!userId) return

  if (activeTab.value === 'blogs') {
    blogStore.fetchUserBlogs(userId, { ...blogQuery, userId })
  } else if (activeTab.value === 'stars') {
    blogStore.fetchUserStarredBlogs(userId, { ...starQuery, userId })
  } else if (activeTab.value === 'likes') {
    blogStore.fetchUserLikedBlogs(userId, { ...likeQuery, userId })
  }
}

const fetchActiveTab = () => {
  if (activeTab.value === 'solved') {
    fetchSolvedProblems()
  } else {
    fetchCurrentBlogs()
  }
}

const loadProfilePage = async () => {
  if (isMyProfileRoute.value && !hasValidUserId(authStore.user?.id)) {
    await authStore.hydrateFromToken()
  }

  const initialUserId = String(targetUserId.value || '')
  if (!isMyProfileRoute.value && !initialUserId) return

  activeTab.value = 'solved'
  profile.value = null
  solvedProblems.value = []
  solvedTotal.value = 0
  blogStore.clearUserBlogLists()
  resetQueries()

  const profileData = await fetchProfile(initialUserId)
  const resolvedUserId = isMyProfileRoute.value
    ? profileData?.user.id || authStore.user?.id || ''
    : initialUserId

  if (resolvedUserId) {
    await fetchSolvedProblems(resolvedUserId)
  }
}

const handleTabChange = () => {
  fetchActiveTab()
}

const showTab = (tab: ProfileTab) => {
  activeTab.value = tab
  fetchActiveTab()
}

const handleDifficultyChange = () => {
  solvedQuery.pageNum = 1
  fetchSolvedProblems()
}

const handleSolvedSizeChange = () => {
  solvedQuery.pageNum = 1
  fetchSolvedProblems()
}

const handleBlogPageChange = (pageNo: number) => {
  currentBlogQuery.value.pageNo = pageNo
  fetchCurrentBlogs()
}

const handleBlogSizeChange = (pageSize: number) => {
  currentBlogQuery.value.pageNo = 1
  currentBlogQuery.value.pageSize = pageSize
  fetchCurrentBlogs()
}

const handleProblemClick = (problem: SolvedProblemVO) => {
  router.push(`/problem/${problem.problemId}`)
}

const handleBlogClick = (blog: Blog) => {
  router.push(`/blog/${blog.id}`)
}

watch(
  () => [route.name, route.params.userId],
  () => {
    loadProfilePage()
  },
  { immediate: true }
)

const smallIconStyle = {
  width: '13px',
  height: '13px',
  minWidth: '13px',
  fontSize: '13px',
  lineHeight: '13px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center'
}

const renderIcon = (icon: Component) => h(
  'span',
  { class: 'inline-icon', style: smallIconStyle },
  [h(icon, { style: { width: '13px', height: '13px' } })]
)
const ElEmpty = resolveComponent('ElEmpty')
const ElPagination = resolveComponent('ElPagination')
const ElTag = resolveComponent('ElTag')

const BlogListContent = defineComponent({
  name: 'BlogListContent',
  props: {
    blogs: {
      type: Array as PropType<Blog[]>,
      required: true
    },
    emptyText: {
      type: String,
      required: true
    }
  },
  emits: ['open-blog'],
  setup(props, { emit }) {
    const truncateContent = (content: string) => {
      const maxLength = 200
      return content.length > maxLength ? `${content.substring(0, maxLength)}...` : content
    }

    return () => {
      if (props.blogs.length === 0) {
        return h('div', { class: 'empty-wrap' }, [
          h(ElEmpty, { description: props.emptyText })
        ])
      }

      return h('div', props.blogs.map((blog) => h('article', {
        key: blog.id,
        class: 'blog-item',
        onClick: () => emit('open-blog', blog)
      }, [
        h('div', { class: 'blog-header' }, [
          h('div', { class: 'blog-title-line' }, [
            h('h3', { class: 'blog-title' }, blog.title),
            blog.blogType === 1 ? h(ElTag, { type: 'success', size: 'small', style: { marginLeft: '8px' } }, '题解') : null
          ]),
          blog.tags && blog.tags.length > 0 ? h('div', { class: 'blog-tags' }, blog.tags.map((tag) =>
            h(ElTag, { key: tag.id, size: 'small', type: 'info', style: { marginRight: '8px' } }, tag.name)
          )) : null
        ]),
        h('p', { class: 'blog-content' }, truncateContent(blog.content || '')),
        h('div', { class: 'blog-footer' }, [
          h('span', { class: 'blog-meta' }, [
            renderIcon(Calendar),
            formatDateTime(blog.createTime)
          ]),
          h('span', { class: 'blog-stats' }, [
            h('span', { class: 'stat-inline' }, [
              renderIcon(View),
              String(blog.viewCount || 0)
            ]),
            h('span', { class: 'stat-inline' }, [
              renderIcon(Star),
              String(blog.likeCount || 0)
            ])
          ])
        ])
      ])))
    }
  }
})

const BlogPagination = defineComponent({
  name: 'BlogPagination',
  props: {
    total: {
      type: [Number, String],
      required: true
    },
    pageNo: {
      type: [Number, String],
      required: true
    },
    pageSize: {
      type: [Number, String],
      required: true
    }
  },
  emits: ['page-change', 'size-change'],
  setup(props, { emit }) {
    return () => Number(props.total) > 0
      ? h('div', { class: 'pagination-container' }, [
        h(ElPagination, {
          currentPage: Number(props.pageNo),
          pageSize: Number(props.pageSize),
          total: Number(props.total),
          pageSizes: [10, 20, 50],
          layout: 'total, sizes, prev, pager, next, jumper',
          onCurrentChange: (pageNo: number) => emit('page-change', pageNo),
          onSizeChange: (pageSize: number) => emit('size-change', pageSize)
        })
      ])
      : null
  }
})

onMounted(() => {
  blogStore.fetchTags()
})
</script>

<style scoped lang="scss">
.profile-container {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 20px;
}

.profile-overview,
.profile-detail {
  border-radius: 8px;
}

.profile-detail {
  margin-top: 18px;
}

.overview-content {
  min-height: 260px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 22px;
  padding-bottom: 22px;
  border-bottom: 1px solid #ebeef5;
}

.profile-avatar {
  flex-shrink: 0;
  background: #409eff;
  color: #fff;
  font-size: 32px;
  font-weight: 600;
}

.profile-main {
  min-width: 0;
}

.profile-title {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  h2 {
    margin: 0;
    color: #303133;
    font-size: 28px;
    line-height: 1.25;
    word-break: break-word;
  }
}

.profile-meta {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
  margin-top: 10px;
  color: #606266;
  font-size: 14px;

  span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  :deep(.el-icon) {
    width: 13px;
    height: 13px;
    font-size: 13px;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 12px;
  margin-top: 22px;
}

.stat-tile {
  display: flex;
  min-height: 88px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 14px 8px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #f8fafc;
  color: inherit;
  font: inherit;
}

button.stat-tile {
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;

  &:hover {
    border-color: #409eff;
    box-shadow: 0 4px 14px rgba(64, 158, 255, 0.14);
    transform: translateY(-1px);
  }
}

.stat-value {
  max-width: 100%;
  color: #303133;
  font-size: 26px;
  font-weight: 700;
  line-height: 1.15;
  word-break: break-word;
}

.stat-label {
  color: #606266;
  font-size: 13px;
}

.difficulty-panel {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 22px;
}

.difficulty-item {
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.difficulty-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
  color: #606266;
  font-size: 14px;
}

.tab-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;

  span {
    min-width: 20px;
    padding: 0 6px;
    border-radius: 999px;
    background: #f0f2f5;
    color: #606266;
    font-size: 12px;
    line-height: 18px;
    text-align: center;
  }
}

.table-toolbar {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 16px;
}

.solved-table {
  width: 100%;

  :deep(.el-table__row) {
    cursor: pointer;
  }
}

.blog-list {
  min-height: 280px;

  :deep(.blog-item) {
    padding: 20px 20px 16px;
    margin-bottom: 16px;
    border: 1px solid #ebeef5;
    border-left: 3px solid #409eff;
    border-radius: 6px;
    background: #fff;
    cursor: pointer;
    transition: all 0.25s ease;

    &:hover {
      border-color: #c6d9f0;
      border-left-color: #337ecc;
      box-shadow: 0 4px 16px rgba(64, 158, 255, 0.1);
      transform: translateY(-2px);
    }

    &:hover :deep(.blog-title) {
      color: #409eff;
    }
  }

  :deep(.blog-header) {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 10px;
    gap: 12px;
  }

  :deep(.blog-title-line) {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    min-width: 0;
  }

  :deep(.blog-tags) {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    flex-shrink: 0;
  }

  :deep(.blog-title) {
    min-width: 0;
    margin: 0;
    color: #303133;
    font-size: 17px;
    font-weight: 600;
    line-height: 1.4;
    word-break: break-word;
    transition: color 0.2s ease;
  }

  :deep(.blog-content) {
    display: -webkit-box;
    margin: 0 0 14px 0;
    overflow: hidden;
    color: #6b7280;
    font-size: 14px;
    line-height: 1.7;
    text-overflow: ellipsis;
    word-break: break-word;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  }

  :deep(.blog-footer) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    padding-top: 12px;
    border-top: 1px solid #f0f2f5;
    color: #9ca3af;
    font-size: 13px;
  }

  :deep(.blog-meta),
  :deep(.blog-stats),
  :deep(.stat-inline) {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  :deep(.blog-stats) {
    display: flex;
    gap: 14px;
  }

  :deep(.inline-icon) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 13px;
    height: 13px;
    min-width: 13px;
    line-height: 1;
    color: inherit;
    font-size: 13px;

    :deep(svg) {
      width: 13px;
      height: 13px;
    }
  }

  :deep(.empty-wrap) {
    padding: 28px 0;
  }
}

:global(.profile-container .blog-footer .inline-icon),
:global(.profile-container .blog-footer .inline-icon svg) {
  width: 13px !important;
  height: 13px !important;
  min-width: 13px !important;
  font-size: 13px !important;
  line-height: 13px !important;
}

:global(.profile-container .blog-footer .el-icon),
:global(.profile-container .blog-footer .el-icon svg) {
  width: 13px !important;
  height: 13px !important;
  font-size: 13px !important;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

@media (max-width: 960px) {
  .stats-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .difficulty-panel {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .profile-container {
    padding: 12px;
  }

  .profile-header {
    align-items: flex-start;
  }

  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .blog-list :deep(.blog-header) {
    flex-direction: column;
  }
}
</style>
