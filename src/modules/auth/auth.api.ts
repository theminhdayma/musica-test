import type {
  LoginResponseData,
  RequestOtpInput,
  RequestOtpResponseData,
  VerifyOtpInput,
  VerifyOtpResponseData,
  RegisterBuyerInput,
  RegisterArtistInput,
  GoogleLoginInput,
  ForgotPasswordRequestInput,
  ForgotPasswordConfirmInput,
  ForgotPasswordRequestResponseData,
  ForgotPasswordConfirmResponseData,
  MeProfile
} from './types'
import { apiRequest } from '../../shared/api/http'

export async function loginApi(input: { email: string; password: string; requestedRole?: 'BUYER' | 'ARTIST' }) {
  const res = await apiRequest<LoginResponseData>({
    path: '/client/auth/login',
    method: 'POST',
    body: input
  })
  return { data: res.data }
}

export async function requestOtpApi(input: RequestOtpInput) {
  const res = await apiRequest<RequestOtpResponseData>({
    path: '/client/auth/otp/request',
    method: 'POST',
    body: input
  })
  return { data: res.data }
}

export async function verifyOtpApi(input: VerifyOtpInput) {
  const res = await apiRequest<VerifyOtpResponseData>({
    path: '/client/auth/otp/verify',
    method: 'POST',
    body: input
  })
  return { data: res.data }
}

export async function registerBuyerApi(input: RegisterBuyerInput) {
  const res = await apiRequest<LoginResponseData>({
    path: '/client/auth/register/buyer',
    method: 'POST',
    body: input
  })
  return { data: res.data }
}

export async function registerArtistApi(input: RegisterArtistInput) {
  const res = await apiRequest<LoginResponseData>({
    path: '/client/auth/register/artist',
    method: 'POST',
    body: input
  })
  return { data: res.data }
}

export async function loginGoogleApi(input: GoogleLoginInput) {
  const res = await apiRequest<LoginResponseData>({
    path: '/client/auth/login/google',
    method: 'POST',
    body: input
  })
  return { data: res.data }
}

export async function forgotPasswordRequestApi(input: ForgotPasswordRequestInput) {
  const res = await apiRequest<ForgotPasswordRequestResponseData>({
    path: '/client/auth/forgot-password/request',
    method: 'POST',
    body: input
  })
  return { data: res.data }
}

export async function forgotPasswordConfirmApi(input: ForgotPasswordConfirmInput) {
  const res = await apiRequest<ForgotPasswordConfirmResponseData>({
    path: '/client/auth/forgot-password/confirm',
    method: 'POST',
    body: input
  })
  return { data: res.data }
}

export async function getMeApi() {
  const res = await apiRequest<MeProfile>({
    path: '/me',
    method: 'GET'
  })
  return { data: res.data }
}

export async function changePasswordApi(input: { oldPassword: string; newPassword: string }) {
  const res = await apiRequest<{ ok: true }>({
    path: '/me/changePassword',
    method: 'POST',
    body: input
  })
  return { data: res.data }
}
