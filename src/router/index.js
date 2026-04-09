import { createRouter, createWebHistory } from 'vue-router'

import ConflictDetailView from '../views/ConflictDetailView.vue'
import ConflictsView from '../views/ConflictsView.vue'
import CountriesView from '../views/CountriesView.vue'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/conflicts',
      name: 'conflicts',
      component: ConflictsView,
    },
    {
      path: '/conflicts/:id',
      name: 'conflict-detail',
      component: ConflictDetailView,
    },
    {
      path: '/countries',
      name: 'countries',
      component: CountriesView,
    },
  ],
})

export default router
