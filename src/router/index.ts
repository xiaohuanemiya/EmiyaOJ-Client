import { createRouter, createWebHistory } from 'vue-router'
import ProblemListView from '../views/ProblemListView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/problems',
    },
    {
      path: '/problems',
      name: 'problems',
      component: ProblemListView,
    },
    {
      path: '/problem/:id',
      name: 'problem-detail',
      component: () => import('../views/ProblemDetailView.vue'),
    },
    {
      path: '/submissions',
      name: 'submissions',
      component: () => import('../views/SubmissionListView.vue'),
    },
    {
      path: '/submission/:id',
      name: 'submission-detail',
      component: () => import('../views/SubmissionDetailView.vue'),
    },
  ],
})

export default router
