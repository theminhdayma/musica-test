import { createRouter, createWebHistory } from 'vue-router'

export const routes = [
  { path: '/', name: 'home', component: () => import('../pages/home/index.page.vue') },
  { path: '/market', name: 'market', component: () => import('../pages/market/index.page.vue') },
  { path: '/search/:q?/:tab?', name: 'search', component: () => import('../pages/search/index.page.vue'), props: true },
  { path: '/product/:id', name: 'product', component: () => import('../pages/product/index.page.vue'), props: true },
  { path: '/cart', name: 'cart', component: () => import('../pages/cart/index.page.vue') },
  { path: '/checkout', name: 'checkout', component: () => import('../pages/checkout/index.page.vue') },
  { path: '/success', name: 'success', component: () => import('../pages/success/index.page.vue') },
  { path: '/login', name: 'login', component: () => import('../pages/auth/login.page.vue') },
  { path: '/me/certificates', name: 'my-certificates', component: () => import('../pages/certificates/list.page.vue'), meta: { requiresAuth: true, requiredRoles: ['BUYER'] } },
  { path: '/me/certificates/:certificateId', name: 'certificate-detail', component: () => import('../pages/certificates/detail.page.vue'), props: true, meta: { requiresAuth: true, requiredRoles: ['BUYER'] } },
  { path: '/me/products', name: 'my-products', component: () => import('../pages/me-products/list.page.vue'), meta: { requiresAuth: true, requiredRoles: ['ARTIST'] } },
  { path: '/me/products/:productId', name: 'my-product-detail', component: () => import('../pages/me-products/detail.page.vue'), props: true, meta: { requiresAuth: true, requiredRoles: ['ARTIST'] } }
]

export function createAppRouter() {
  return createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior() {
      return { top: 0, behavior: 'smooth' }
    }
  })
}
