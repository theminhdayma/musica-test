import type { Router } from 'vue-router'
import type { AuthRole } from '../modules/auth/types'
import { useAuthStore } from '../modules/auth/auth.store'
import { getDefaultAuthenticatedRoute } from '../modules/auth/auth.routing'
import {
  canAccessArtistArea,
  canAccessBuyerArea,
  hasClientPermission
} from '../modules/auth/auth.capabilities'

type AuthStore = ReturnType<typeof useAuthStore>

function hasAnyRole(userRoles: AuthRole[], required?: unknown) {
  if (!required) return true
  if (!Array.isArray(required)) return true
  return required.some((requiredRole) => {
    if (requiredRole === 'BUYER') {
      return canAccessBuyerArea(userRoles)
    }

    if (requiredRole === 'ARTIST') {
      return canAccessArtistArea(userRoles)
    }

    return userRoles.includes(requiredRole as AuthRole)
  })
}

function hasRequiredPermissions(auth: AuthStore, required?: unknown) {
  if (!required) return true
  if (!Array.isArray(required)) return true

  return required.every((permission) => (
    typeof permission === 'string' && hasClientPermission({
      isAuthenticated: auth.isAuthenticated,
      roles: auth.roles,
      currentUser: auth.currentUser,
      me: auth.me
    }, permission as never)
  ))
}

export function installRouterGuards(input: { router: Router; auth: AuthStore }) {
  input.router.beforeEach((to) => {
    input.auth.hydrate()

    if (to.name === 'login' && input.auth.isAuthenticated) {
      return getDefaultAuthenticatedRoute(input.auth.roles, input.auth.selectedRole)
    }

    const requiresAuth = !!to.meta?.requiresAuth
    const requiredRoles = to.meta?.requiredRoles
    const requiredPermissions = to.meta?.requiredPermissions

    if (!requiresAuth) return true
    if (!input.auth.isAuthenticated) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }
    if (!hasAnyRole(input.auth.roles, requiredRoles)) {
      return { name: 'home' }
    }
    if (!hasRequiredPermissions(input.auth, requiredPermissions)) {
      return { name: 'home' }
    }
    return true
  })
}
