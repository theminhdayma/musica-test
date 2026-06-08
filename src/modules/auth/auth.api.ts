import type { LoginResponseData } from './types'
import { apiRequest, getApiBaseUrl } from '../../shared/api/http'

export async function loginApi(input: { email: string; password: string }) {
  const baseUrl = getApiBaseUrl()
  if (!baseUrl) {
    const role = input.email.toLowerCase().includes('artist') ? 'ARTIST' : 'BUYER'
    const data: LoginResponseData = {
      accessToken: Math.random().toString(36).slice(2) + Date.now().toString(36),
      tokenType: 'Bearer',
      expiresInSeconds: 60 * 60 * 24 * 7,
      user: {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
        email: input.email,
        fullName: role === 'ARTIST' ? 'Artist' : 'Buyer',
        status: 'ACTIVE'
      },
      roles: [role]
    }
    return { data }
  }

  const res = await apiRequest<LoginResponseData>({
    path: '/auth/login',
    method: 'POST',
    body: input
  })
  return { data: res.data }
}

