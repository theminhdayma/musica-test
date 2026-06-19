import type {
  LoginResponseData,
  RequestOtpInput,
  VerifyOtpInput,
  VerifyOtpResponseData,
  RegisterBuyerInput,
  RegisterArtistInput,
  GoogleLoginInput,
  LinkGoogleInput,
  ForgotPasswordRequestInput,
  ForgotPasswordConfirmInput,
  MeProfile
} from './types'
import { apiRequest, getApiBaseUrl } from '../../shared/api/http'

export async function loginApi(input: { email: string; password: string; requestedRole: 'BUYER' | 'ARTIST' }) {
  const baseUrl = getApiBaseUrl()
  // Mock logic if no baseUrl configured
  if (!baseUrl) {
    const role = input.requestedRole
    const data: LoginResponseData = {
      accessToken: Math.random().toString(36).slice(2) + Date.now().toString(36),
      tokenType: 'Bearer',
      expiresInSeconds: 60 * 60 * 24 * 7,
      user: {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
        email: input.email,
        fullName: role === 'ARTIST' ? 'Artist Mock' : 'Buyer Mock',
        status: 'ACTIVE'
      },
      roles: [role]
    }
    return { data }
  }

  const res = await apiRequest<LoginResponseData>({
    path: '/client/auth/login',
    method: 'POST',
    body: input
  })
  return { data: res.data }
}

export async function requestOtpApi(input: RequestOtpInput) {
  const baseUrl = getApiBaseUrl()
  if (!baseUrl) {
    return { data: { success: true } }
  }
  const res = await apiRequest<{ success: boolean }>({
    path: '/client/auth/otp/request',
    method: 'POST',
    body: input
  })
  return { data: res.data }
}

export async function verifyOtpApi(input: VerifyOtpInput) {
  const baseUrl = getApiBaseUrl()
  if (!baseUrl) {
    const data: VerifyOtpResponseData = {
      verified: true,
      verificationToken: 'mock-verification-token-' + Math.random().toString(36).slice(2)
    }
    return { data }
  }
  const res = await apiRequest<VerifyOtpResponseData>({
    path: '/client/auth/otp/verify',
    method: 'POST',
    body: input
  })
  return { data: res.data }
}

export async function registerBuyerApi(input: RegisterBuyerInput) {
  const baseUrl = getApiBaseUrl()
  if (!baseUrl) {
    const data: LoginResponseData = {
      accessToken: 'mock-buyer-token-' + Math.random().toString(36).slice(2),
      tokenType: 'Bearer',
      expiresInSeconds: 60 * 60 * 24 * 7,
      user: {
        id: 'mock-buyer-id',
        email: input.email,
        fullName: input.fullName,
        status: 'ACTIVE'
      },
      roles: ['BUYER']
    }
    return { data }
  }
  const res = await apiRequest<LoginResponseData>({
    path: '/client/auth/register/buyer',
    method: 'POST',
    body: input
  })
  return { data: res.data }
}

export async function registerArtistApi(input: RegisterArtistInput) {
  const baseUrl = getApiBaseUrl()
  if (!baseUrl) {
    const data: LoginResponseData = {
      accessToken: 'mock-artist-token-' + Math.random().toString(36).slice(2),
      tokenType: 'Bearer',
      expiresInSeconds: 60 * 60 * 24 * 7,
      user: {
        id: 'mock-artist-id',
        email: input.email,
        fullName: input.fullName,
        status: 'ACTIVE'
      },
      roles: ['ARTIST']
    }
    return { data }
  }
  const res = await apiRequest<LoginResponseData>({
    path: '/client/auth/register/artist',
    method: 'POST',
    body: input
  })
  return { data: res.data }
}

export async function loginGoogleApi(input: GoogleLoginInput) {
  const baseUrl = getApiBaseUrl()
  if (!baseUrl) {
    const data: LoginResponseData = {
      accessToken: 'mock-google-token-' + Math.random().toString(36).slice(2),
      tokenType: 'Bearer',
      expiresInSeconds: 60 * 60 * 24 * 7,
      user: {
        id: 'mock-google-buyer-id',
        email: 'googlebuyer@example.com',
        fullName: 'Google Buyer',
        status: 'ACTIVE'
      },
      roles: ['BUYER']
    }
    return { data }
  }
  const res = await apiRequest<LoginResponseData>({
    path: '/client/auth/login/google',
    method: 'POST',
    body: input
  })
  return { data: res.data }
}

export async function linkGoogleApi(input: LinkGoogleInput) {
  const baseUrl = getApiBaseUrl()
  if (!baseUrl) {
    return { data: { success: true } }
  }
  const res = await apiRequest<{ success: boolean }>({
    path: '/client/auth/link/google',
    method: 'POST',
    body: input
  })
  return { data: res.data }
}

export async function forgotPasswordRequestApi(input: ForgotPasswordRequestInput) {
  const baseUrl = getApiBaseUrl()
  if (!baseUrl) {
    return { data: { success: true } }
  }
  const res = await apiRequest<{ success: boolean }>({
    path: '/client/auth/forgot-password/request',
    method: 'POST',
    body: input
  })
  return { data: res.data }
}

export async function forgotPasswordConfirmApi(input: ForgotPasswordConfirmInput) {
  const baseUrl = getApiBaseUrl()
  if (!baseUrl) {
    return { data: { success: true } }
  }
  const res = await apiRequest<{ success: boolean }>({
    path: '/client/auth/forgot-password/confirm',
    method: 'POST',
    body: input
  })
  return { data: res.data }
}

export async function getMeApi() {
  const baseUrl = getApiBaseUrl()
  if (!baseUrl) {
    const data: MeProfile = {
      user: {
        id: 'mock-me-id',
        email: 'mockme@example.com',
        fullName: 'Mock Me Name',
        roleName: 'BUYER'
      },
      profile: {}
    }
    return { data }
  }
  const res = await apiRequest<MeProfile>({
    path: '/me',
    method: 'GET'
  })
  return { data: res.data }
}
