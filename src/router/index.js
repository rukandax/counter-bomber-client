import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Join',
    component: () => import(/* webpackChunkName: "Join" */ '../views/Join.vue')
  },
  {
    path: '/gameplay',
    name: 'Gameplay',
    component: () => import(/* webpackChunkName: "Gameplay" */ '../views/Gameplay.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
