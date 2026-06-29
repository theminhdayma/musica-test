export type AuthRole = 'SUPER_ADMIN' | 'ADMIN' | 'ARTIST' | 'BUYER'
export type ClientRole = 'BUYER' | 'ARTIST'

export type AuthUser = {
  id: string
  email: string
  fullName: string | null
  phoneNumber?: string | null
  status: string
  roleId?: number | null
  roleName?: AuthRole | null
}

export type LoginResponseData = {
  accessToken: string
  tokenType: 'Bearer'
  expiresInSeconds: number
  user: AuthUser
  roles?: AuthRole[]
}

export type OtpPurpose = 'signup_buyer' | 'signup_artist' | 'forgot_password'

export type RequestOtpInput = {
  email: string
  purpose: OtpPurpose
}

export type RequestOtpResponseData = {
  accepted: boolean
  otpId?: string
  expiresAt?: string
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
  phoneNumber?: string
  verificationToken: string
}

export type RegisterArtistInput = {
  email: string
  password: string
  fullName: string
  phoneNumber?: string
  verificationToken: string
}

export type GoogleLoginInput = {
  firebaseIdToken: string
}

export type ForgotPasswordRequestInput = {
  email: string
}

export type ForgotPasswordRequestResponseData = {
  accepted: boolean
}

export type ForgotPasswordConfirmInput = {
  email: string
  verificationToken: string
  newPassword: string
}

export type ForgotPasswordConfirmResponseData = {
  reset: boolean
}

export type MeUser = {
  id: string
  email: string
  fullName: string | null
  phoneNumber?: string | null
  status: string
  roleId: number
  roleName: AuthRole
}

export type BuyerProfile = {
  id?: string
  userId?: string
  avatarUrl?: string | null
  buyerStatus?: string | null
  dateOfBirth?: string | null
  preferencesMeta?: Record<string, unknown> | null
  updatedAt?: string | null
}

export type ArtistProfile = {
  id?: string
  userId?: string
  stageName?: string | null
  bio?: string | null
  primaryGenre?: string | null
  countryCode?: string | null
  avatarKey?: string | null
  coverImageKey?: string | null
  updatedAt?: string | null
}

export type MeUserProfile = BuyerProfile | ArtistProfile | null

export type MeProfile = {
  user: MeUser
  profile: MeUserProfile
}

export type PendingOtpChallenge = {
  email: string
  purpose: OtpPurpose
}

export type PendingForgotPassword = {
  email: string
  verificationToken?: string | null
}
