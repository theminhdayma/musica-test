import type { Router } from 'vue-router'
import type { AuthRole } from '../modules/auth/types'
import { useAuthStore } from '../modules/auth/auth.store'

type AuthStore = ReturnType<typeof useAuthStore>

function hasAnyRole(userRoles: AuthRole[], required?: unknown) {
  if (!required) return true
  if (!Array.isArray(required)) return true
  return required.some(r => userRoles.includes(r as AuthRole))
}

export function installRouterGuards(input: { router: Router; auth: AuthStore }) {
  input.router.beforeEach((to) => {
    input.auth.hydrate()

    if (to.name === 'login' && input.auth.isAuthenticated) {
      if (input.auth.roles.includes('ARTIST')) return { name: 'my-products' }
      if (input.auth.roles.includes('BUYER')) return { name: 'my-certificates' }
      return { name: 'home' }
    }

    const requiresAuth = !!to.meta?.requiresAuth
    const requiredRoles = to.meta?.requiredRoles

    if (!requiresAuth) return true
    if (!input.auth.isAuthenticated) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }
    if (!hasAnyRole(input.auth.roles, requiredRoles)) {
      return { name: 'home' }
    }
    return true
  })
}
