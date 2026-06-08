export type AuthRole = 'SUPER_ADMIN' | 'ADMIN' | 'ARTIST' | 'BUYER'

export type AuthUser = {
  id: string
  email: string
  fullName: string
  status: string
}

export type LoginResponseData = {
  accessToken: string
  tokenType: 'Bearer'
  expiresInSeconds: number
  user: AuthUser
  roles: AuthRole[]
}

