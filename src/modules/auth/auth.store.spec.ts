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
    expect(store.user).toBeNull()
    expect(store.me).toBeNull()
    expect(store.pendingOtpChallenge).toBeNull()
    expect(store.pendingGoogleLink).toBeNull()
    expect(store.pendingForgotPassword).toBeNull()
  })

  it('should request OTP and transition to pendingOtpChallenge state', async () => {
    const store = useAuthStore()
    const mockRequestOtp = vi.spyOn(authApi, 'requestOtpApi').mockResolvedValue({ data: { success: true } })

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
        user: { id: 'u1', email: 'test@example.com', fullName: 'Test User Profile', roleName: 'BUYER' },
        profile: { address: 'VN' }
      }
    })

    await store.loginWithPassword('test@example.com', 'secret', 'BUYER')

    expect(mockLogin).toHaveBeenCalled()
    expect(store.accessToken).toBe('jwt-token')
    expect(store.user).toEqual({ id: 'u1', email: 'test@example.com', fullName: 'Test User', status: 'ACTIVE' })
    expect(store.roles).toEqual(['BUYER'])

    // /me hydration
    expect(mockGetMe).toHaveBeenCalled()
    expect(store.me).toEqual({
      user: { id: 'u1', email: 'test@example.com', fullName: 'Test User Profile', roleName: 'BUYER' },
      profile: { address: 'VN' }
    })
  })
})
