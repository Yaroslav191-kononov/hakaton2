import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Patients from '../views/Patients.vue';
import PatientDetail from '../views/PatientDetail.vue';


const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/patients', component: Patients, meta: { requiresAuth: true } },
  { path: '/patients/:id', component: PatientDetail, meta: { requiresAuth: true } }
];


const router = createRouter({
  history: createWebHistory(),
  routes
});


router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('pt_token');
  if (to.meta.requiresAuth && !token) {
    return next('/login');
  }
  next();
});


export default router;