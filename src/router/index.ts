import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue'),
      meta: { requiresAuth: false, title: '登录' }
    },
    {
      path: '/',
      redirect: '/problems'
    },
    {
      path: '/problems',
      name: 'ProblemList',
      component: () => import('../views/ProblemList.vue'),
      meta: { requiresAuth: true, title: '题目列表' }
    },
    {
      path: '/problem/:id',
      name: 'ProblemDetail',
      component: () => import('../views/ProblemDetail.vue'),
      meta: { requiresAuth: true, title: '题目详情' }
    },
    {
      path: '/submissions',
      name: 'SubmissionList',
      component: () => import('../views/SubmissionList.vue'),
      meta: { requiresAuth: true, title: '提交记录' }
    }
  ]
})

// 全局前置守卫
router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()

  // 设置页面标题
  document.title = `${to.meta.title || 'EmiyaOJ'} - 在线评测系统`

  // 登录页处理
  if (to.path === '/login') {
    if (userStore.isLoggedIn()) {
      next('/')
    } else {
      next()
    }
    return
  }

  // 认证检查
  if (to.meta.requiresAuth !== false) {
    if (!userStore.isLoggedIn()) {
      next('/login')
      return
    }
  }

  next()
})

export default router
