import { createRouter, createWebHistory } from 'vue-router';
import Login from '../View/Login.vue';
import Dashboard from '../View/Dashboard.vue';
const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
