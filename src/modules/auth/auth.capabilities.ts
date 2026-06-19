import type { AuthRole, ClientRole } from './types'

export function hasRole(roles: AuthRole[], role: AuthRole) {
  return roles.includes(role)
}

export function canAccessArtistArea(roles: AuthRole[]) {
  return hasRole(roles, 'ARTIST')
}

export function canAccessBuyerArea(roles: AuthRole[]) {
  return hasRole(roles, 'BUYER')
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
