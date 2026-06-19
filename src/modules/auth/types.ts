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

export type OtpPurpose = 'signup_buyer' | 'signup_artist' | 'link_google' | 'forgot_password'

export type RequestOtpInput = {
  email: string
  purpose: OtpPurpose
}

export type VerifyOtpInput = {
  email: string
  purpose: OtpPurpose
  code: string
}

export type VerifyOtpResponseData = {
  verified: boolean
  verificationToken: string
}

export type RegisterBuyerInput = {
  email: string
  password: string
  fullName: string
  verificationToken: string
}

export type RegisterArtistInput = {
  email: string
  password: string
  fullName: string
  verificationToken: string
}

export type GoogleLoginInput = {
  firebaseIdToken: string
}

export type LinkGoogleInput = {
  firebaseIdToken: string
  verificationToken: string
}

export type ForgotPasswordRequestInput = {
  email: string
}

export type ForgotPasswordConfirmInput = {
  email: string
  code: string
  newPassword: string
}

export type MeProfile = {
  user: {
    id: string
    email: string
    fullName: string
    roleName: AuthRole
  }
  profile: Record<string, unknown>
}
