import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login/index.vue'),
      meta: {
        requiresAuth: false,
        title: '登录'
      }
    },
    {
      path: '/',
      component: () => import('@/layouts/DefaultLayout.vue'),
      children: [
        {
          path: '',
          name: 'Home',
          component: () => import('@/views/Home/index.vue'),
          meta: {
            requiresAuth: false,
            title: '首页'
          }
        },
        {
          path: 'problems',
          name: 'ProblemList',
          component: () => import('@/views/ProblemList/index.vue'),
          meta: {
            requiresAuth: false,
            title: '题目列表'
          }
        },
        {
          path: 'problem/:id',
          name: 'ProblemDetail',
          component: () => import('@/views/ProblemDetail/index.vue'),
          meta: {
            requiresAuth: true,
            title: '题目详情'
          }
        },
        {
          path: 'submissions',
          name: 'SubmissionList',
          component: () => import('@/views/SubmissionList/index.vue'),
          meta: {
            requiresAuth: true,
            title: '提交记录'
          }
        },
        {
          path: 'submission/:id',
          name: 'SubmissionDetail',
          component: () => import('@/views/SubmissionDetail/index.vue'),
          meta: {
            requiresAuth: true,
            title: '提交详情'
          }
        },
        {
          path: 'profile',
          name: 'Profile',
          component: () => import('@/views/Profile/index.vue'),
          meta: {
            requiresAuth: true,
            title: '个人中心'
          }
        },
        // 博客相关路由
        {
          path: 'blogs',
          name: 'BlogList',
          component: () => import('@/views/BlogList/index.vue'),
          meta: {
            requiresAuth: false,
            title: '博客列表'
          }
        },
        {
          path: 'blog/create',
          name: 'BlogCreate',
          component: () => import('@/views/BlogEdit/index.vue'),
          meta: {
            requiresAuth: true,
            title: '发布博客'
          }
        },
        {
          path: 'blog/edit/:id',
          name: 'BlogEdit',
          component: () => import('@/views/BlogEdit/index.vue'),
          meta: {
            requiresAuth: true,
            title: '编辑博客'
          }
        },
        {
          path: 'blog/:id',
          name: 'BlogDetail',
          component: () => import('@/views/BlogDetail/index.vue'),
          meta: {
            requiresAuth: false,
            title: '博客详情'
          }
        },
        {
          path: 'blog/user/:uid',
          name: 'UserBlog',
          component: () => import('@/views/UserBlog/index.vue'),
          meta: {
            requiresAuth: false,
            title: '用户博客'
          }
        }
      ]
    }
  ]
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // 设置页面标题
  document.title = `${to.meta.title || 'EmiyaOJ'} - EmiyaOJ`

  // 检查路由是否需要认证
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    ElMessage.warning('请先登录')
    next({
      name: 'Login',
      query: { redirect: to.fullPath }
    })
  } else if (to.name === 'Login' && authStore.isAuthenticated) {
    // 已登录用户访问登录页，重定向到首页
    next({ name: 'Home' })
  } else {
    next()
  }
})

export default router
