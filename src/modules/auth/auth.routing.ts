import type { AuthRole, ClientRole } from './types'
import { hasRole, resolvePreferredClientRole } from './auth.capabilities'

export function getDefaultAuthenticatedRoute(roles: AuthRole[], selectedRole?: ClientRole | null) {
  const effectiveRole = selectedRole && (selectedRole === 'ARTIST' || selectedRole === 'BUYER')
    ? selectedRole
    : resolvePreferredClientRole(roles)

  if (
    (effectiveRole === 'ARTIST' && hasRole(roles, 'ARTIST')) ||
    (effectiveRole === 'BUYER' && hasRole(roles, 'BUYER')) ||
    hasRole(roles, 'ARTIST') ||
    hasRole(roles, 'BUYER')
  ) {
    return { name: 'home' as const }
  }

  return { name: 'home' as const }
}
