/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/default.vue'),
    children: [
      {
        path: '',
        redirect: '/drivers'
      },
      {
        path: '/drivers',
        name: 'drivers',
        component: () => import('@/pages/drivers.vue'),
        meta: {
          title: 'Drivers'
        }
      },
      {
        path: '/customers',
        name: 'customers',
        component: () => import('@/pages/customers.vue'),
        meta: {
          title: 'Customers'
        }
      },
      {
        path: '/tours',
        name: 'tours',
        component: () => import('@/pages/tours.vue'),
        meta: {
          title: 'Tours'
        }
      }
    ]
  }
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (!localStorage.getItem('vuetify:dynamic-reload')) {
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    } else {
      console.error('Dynamic import error, reloading page did not fix it', err)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
