import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from './auth.store'
import * as authApi from './auth.api'

vi.mock('./auth.api')

describe('Auth Store (TDD)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should initialize with default states', () => {
    const store = useAuthStore()
    expect(store.accessToken).toBeNull()
    expect(store.currentUser).toBeNull()
    expect(store.me).toBeNull()
    expect(store.pendingOtpChallenge).toBeNull()
    expect(store.pendingForgotPassword).toBeNull()
    expect(store.selectedRole).toBe('BUYER')
  })

  it('should request OTP and transition to pendingOtpChallenge state', async () => {
    const store = useAuthStore()
    const mockRequestOtp = vi.spyOn(authApi, 'requestOtpApi').mockResolvedValue({ data: { accepted: true } })

    await store.requestOtp('test@example.com', 'signup_buyer')

    expect(mockRequestOtp).toHaveBeenCalledWith({ email: 'test@example.com', purpose: 'signup_buyer' })
    expect(store.pendingOtpChallenge).toEqual({
      email: 'test@example.com',
      purpose: 'signup_buyer'
    })
  })

  it('should verify OTP and store verification token', async () => {
    const store = useAuthStore()
    const mockVerifyOtp = vi.spyOn(authApi, 'verifyOtpApi').mockResolvedValue({
      data: { verified: true, verificationToken: 'proof-123' }
    })

    store.pendingOtpChallenge = { email: 'test@example.com', purpose: 'signup_buyer' }
    const token = await store.verifyOtp('123456')

    expect(mockVerifyOtp).toHaveBeenCalledWith({
      email: 'test@example.com',
      purpose: 'signup_buyer',
      code: '123456'
    })
    expect(token).toBe('proof-123')
  })

  it('should persist forgot-password verification token after OTP verify', async () => {
    const store = useAuthStore()
    vi.spyOn(authApi, 'verifyOtpApi').mockResolvedValue({
      data: { verified: true, verificationToken: 'forgot-proof-123' }
    })

    store.pendingOtpChallenge = { email: 'reset@example.com', purpose: 'forgot_password' }
    const token = await store.verifyOtp('123456')

    expect(token).toBe('forgot-proof-123')
    expect(store.pendingForgotPassword).toEqual({
      email: 'reset@example.com',
      verificationToken: 'forgot-proof-123'
    })
  })

  it('should hydrate /me profile after successful login', async () => {
    const store = useAuthStore()
    const mockLogin = vi.spyOn(authApi, 'loginApi').mockResolvedValue({
      data: {
        accessToken: 'jwt-token',
        tokenType: 'Bearer',
        expiresInSeconds: 3600,
        user: { id: 'u1', email: 'test@example.com', fullName: 'Test User', status: 'ACTIVE' },
        roles: ['BUYER']
      }
    })
    const mockGetMe = vi.spyOn(authApi, 'getMeApi').mockResolvedValue({
      data: {
        user: { id: 'u1', email: 'test@example.com', fullName: 'Test User Profile', roleName: 'BUYER', status: 'ACTIVE', roleId: 4 },
        profile: {}
      }
    })

    await store.loginWithPassword('test@example.com', 'secret', 'BUYER')

    expect(mockLogin).toHaveBeenCalled()
    expect(store.accessToken).toBe('jwt-token')
    expect(store.currentUser).toEqual({ id: 'u1', email: 'test@example.com', fullName: 'Test User', status: 'ACTIVE' })
    expect(store.roles).toEqual(['BUYER'])

    // /me hydration
    expect(mockGetMe).toHaveBeenCalled()
    expect(store.me).toEqual({
      user: { id: 'u1', email: 'test@example.com', fullName: 'Test User Profile', roleName: 'BUYER', status: 'ACTIVE', roleId: 4 },
      profile: {}
    })
  })

  it('should login with Google successfully and hydrate /me', async () => {
    const store = useAuthStore()
    const mockLoginGoogle = vi.spyOn(authApi, 'loginGoogleApi').mockResolvedValue({
      data: {
        accessToken: 'google-jwt-token',
        tokenType: 'Bearer',
        expiresInSeconds: 3600,
        user: { id: 'ug1', email: 'google@example.com', fullName: 'Google User', status: 'ACTIVE', roleName: 'BUYER' }
      }
    })
    const mockGetMe = vi.spyOn(authApi, 'getMeApi').mockResolvedValue({
      data: {
        user: { id: 'ug1', email: 'google@example.com', fullName: 'Google User Profile', roleName: 'BUYER', status: 'ACTIVE', roleId: 4 },
        profile: {}
      }
    })

    await store.loginWithGoogle('firebase-token-123')

    expect(mockLoginGoogle).toHaveBeenCalledWith({ firebaseIdToken: 'firebase-token-123' })
    expect(store.accessToken).toBe('google-jwt-token')
    expect(store.currentUser?.roleName).toBe('BUYER')
    expect(mockGetMe).toHaveBeenCalled()
  })

  it('should surface artist Google policy errors', async () => {
    const store = useAuthStore()
    const apiError = { code: 'ARTIST_GOOGLE_NOT_SUPPORTED', message: 'Artist password only' }
    vi.spyOn(authApi, 'loginGoogleApi').mockRejectedValue(apiError)

    await expect(store.loginWithGoogle('firebase-token-123')).rejects.toEqual(apiError)
    expect(store.errorCode).toBe('ARTIST_GOOGLE_NOT_SUPPORTED')
  })

  it('should confirm forgot password with verification token', async () => {
    const store = useAuthStore()
    const mockConfirmForgotPassword = vi.spyOn(authApi, 'forgotPasswordConfirmApi').mockResolvedValue({
      data: { reset: true }
    })

    store.pendingForgotPassword = {
      email: 'reset@example.com',
      verificationToken: 'forgot-proof-123'
    }

    await store.confirmForgotPassword({
      newPassword: 'NewPassword123!'
    })

    expect(mockConfirmForgotPassword).toHaveBeenCalledWith({
      email: 'reset@example.com',
      verificationToken: 'forgot-proof-123',
      newPassword: 'NewPassword123!'
    })
    expect(store.pendingForgotPassword).toBeNull()
    expect(store.pendingOtpChallenge).toBeNull()
  })
})
