import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized } from 'vue-router'
import { prefetchProduct } from '../modules/catalog/productPrefetch'

export const routes = [
  { path: '/', name: 'home', component: () => import('../pages/home/index.page.vue') },
  { path: '/market', name: 'market', component: () => import('../pages/market/index.page.vue') },
  { path: '/search/:q?/:tab?', name: 'search', component: () => import('../pages/search/index.page.vue'), props: true },
  {
    path: '/product/:id',
    name: 'product',
    component: () => import('../pages/product/index.page.vue'),
    props: true,
    beforeEnter: async (to: RouteLocationNormalized) => {
      const id = String(to.params.id || '')
      await prefetchProduct(id)
      return true
    }
  },
  {
    path: '/cart',
    name: 'cart',
    component: () => import('../pages/cart/index.page.vue'),
    meta: { requiresAuth: true, requiredRoles: ['BUYER'], requiredPermissions: ['manage_order'] }
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: () => import('../pages/checkout/index.page.vue'),
    meta: { requiresAuth: true, requiredRoles: ['BUYER'], requiredPermissions: ['manage_order'] }
  },
  { path: '/success', name: 'success', component: () => import('../pages/success/index.page.vue') },
  
  // Auth Routes
  { path: '/login', redirect: '/auth/login' },
  { path: '/auth/login', name: 'login', component: () => import('../pages/auth/login.page.vue'), meta: { hideHeaderFooter: true } },
  { path: '/auth/register/role', name: 'register-role', component: () => import('../pages/auth/register-role.page.vue'), meta: { hideHeaderFooter: true } },
  { path: '/auth/register/buyer', name: 'register-buyer', component: () => import('../pages/auth/register-buyer.page.vue'), meta: { hideHeaderFooter: true } },
  { path: '/auth/register/artist', name: 'register-artist', component: () => import('../pages/auth/register-artist.page.vue'), meta: { hideHeaderFooter: true } },
  { path: '/auth/otp', name: 'otp', component: () => import('../pages/auth/otp.page.vue'), meta: { hideHeaderFooter: true } },
  { path: '/auth/complete-profile', name: 'complete-profile', component: () => import('../pages/auth/complete-profile.page.vue'), meta: { hideHeaderFooter: true } },
  { path: '/auth/forgot-password', name: 'forgot-password', component: () => import('../pages/auth/forgot-password.page.vue'), meta: { hideHeaderFooter: true } },

  { path: '/help', name: 'help', component: () => import('../pages/help/index.page.vue') },

  // Protected Routes
  { path: '/me', redirect: '/me/dashboard' },
  { path: '/me/dashboard', name: 'my-dashboard', component: () => import('../pages/me/dashboard.page.vue'), meta: { requiresAuth: true, requiredRoles: ['ARTIST'] } },
  { path: '/me/profile', name: 'my-profile', component: () => import('../pages/me/profile.page.vue'), meta: { requiresAuth: true, requiredRoles: ['ARTIST'] } },
  { path: '/me/changePassword', name: 'my-change-password', component: () => import('../pages/me/change-password.page.vue'), meta: { requiresAuth: true, requiredRoles: ['ARTIST'] } },
  { path: '/me/certificates', name: 'my-certificates', component: () => import('../pages/certificates/list.page.vue'), meta: { requiresAuth: true, requiredRoles: ['BUYER'] } },
  { path: '/me/certificates/:certificateId', name: 'certificate-detail', component: () => import('../pages/certificates/detail.page.vue'), props: true, meta: { requiresAuth: true, requiredRoles: ['BUYER'] } },
  { path: '/me/products', name: 'my-products', component: () => import('../pages/me-products/list.page.vue'), meta: { requiresAuth: true, requiredRoles: ['ARTIST'] } },
  { 
    path: '/me/products/:productId/:section?', 
    name: 'my-product-detail', 
    component: () => import('../pages/me-products/detail.page.vue'),
    props: (route) => ({
      productId: String(route.params.productId || ''),
      section: String(route.params.section || ''),
    }),
    meta: { requiresAuth: true, requiredRoles: ['ARTIST'] } 
  }
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
