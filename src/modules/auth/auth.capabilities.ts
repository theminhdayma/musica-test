import type {
  AuthRole,
  AuthUser,
  ClientPermission,
  ClientRole,
  MeProfile
} from './types'

export function hasRole(roles: AuthRole[], role: AuthRole) {
  return roles.includes(role)
}

export function canAccessArtistArea(roles: AuthRole[]) {
  return hasRole(roles, 'ARTIST')
}

export function canAccessBuyerArea(roles: AuthRole[]) {
  return hasRole(roles, 'BUYER')
}

type PermissionContext = {
  isAuthenticated: boolean
  roles: AuthRole[]
  currentUser?: AuthUser | null
  me?: MeProfile | null
}

function normalizeBuyerStatus(status: string | null | undefined) {
  return String(status || 'active').trim().toLowerCase()
}

export function canManageOrder(context: PermissionContext) {
  if (!context.isAuthenticated) return false
  if (!canAccessBuyerArea(context.roles)) return false
  if (context.currentUser?.status && context.currentUser.status !== 'ACTIVE') return false

  const buyerStatus = context.me?.profile && 'buyerStatus' in context.me.profile
    ? normalizeBuyerStatus(context.me.profile.buyerStatus ?? null)
    : 'active'

  return buyerStatus === 'active'
}

export function hasClientPermission(context: PermissionContext, permission: ClientPermission) {
  if (permission === 'manage_order') {
    return canManageOrder(context)
  }

  return false
}

export function resolvePreferredClientRole(roles: AuthRole[], fallback: ClientRole = 'BUYER'): ClientRole {
  if (canAccessArtistArea(roles)) {
    return 'ARTIST'
  }

  if (hasRole(roles, 'BUYER')) {
    return 'BUYER'
  }

  return fallback
}
