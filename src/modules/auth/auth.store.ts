import { defineStore } from 'pinia'
import type {
  AuthRole,
  AuthUser,
  ClientRole,
  LoginResponseData,
  OtpPurpose,
  MeProfile,
  RegisterBuyerInput,
  RegisterArtistInput,
  PendingForgotPassword,
  PendingOtpChallenge
} from './types'
import {
  loginApi,
  requestOtpApi,
  verifyOtpApi,
  registerBuyerApi,
  registerArtistApi,
  loginGoogleApi,
  forgotPasswordRequestApi,
  forgotPasswordConfirmApi,
  getMeApi
} from './auth.api'
import { getAuthErrorMessage } from './auth.messages'
import { resolvePreferredClientRole } from './auth.capabilities'

type LoadingStates = {
  otp: boolean
  register: boolean
  login: boolean
  google: boolean
  forgotPassword: boolean
  hydrateMe: boolean
}

type PersistedAuthState = {
  accessToken: string | null
  currentUser: AuthUser | null
  roles: AuthRole[]
  me: MeProfile | null
  selectedRole: ClientRole
  pendingOtpChallenge: PendingOtpChallenge | null
  pendingForgotPassword: PendingForgotPassword | null
}

const STORAGE_KEY = 'musica_auth_v2'
const DEFAULT_CLIENT_ROLE: ClientRole = 'BUYER'

function getDefaultLoadingStates(): LoadingStates {
  return {
    otp: false,
    register: false,
    login: false,
    google: false,
    forgotPassword: false,
    hydrateMe: false
  }
}

function isClientRole(role: AuthRole | ClientRole | null | undefined): role is ClientRole {
  return role === 'BUYER' || role === 'ARTIST'
}

function readPersisted(): PersistedAuthState | null {
  if (typeof window === 'undefined' || !globalThis.sessionStorage) return null
  const raw = globalThis.sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as PersistedAuthState
  } catch {
    return null
  }
}

function writePersisted(value: PersistedAuthState | null) {
  if (typeof window === 'undefined' || !globalThis.sessionStorage) return
  if (!value) {
    globalThis.sessionStorage.removeItem(STORAGE_KEY)
    return
  }

  globalThis.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value))
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null as string | null,
    currentUser: null as AuthUser | null,
    roles: [] as AuthRole[],
    me: null as MeProfile | null,
    selectedRole: DEFAULT_CLIENT_ROLE as ClientRole,
    hydrated: false,
    pendingOtpChallenge: null as PendingOtpChallenge | null,
    pendingForgotPassword: null as PendingForgotPassword | null,
    loadingStates: getDefaultLoadingStates(),
    errorCode: null as string | null,
    errorMessage: null as string | null
  }),
  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    user: (state) => state.currentUser
  },
  actions: {
    syncPersisted() {
      writePersisted({
        accessToken: this.accessToken,
        currentUser: this.currentUser,
        roles: this.roles,
        me: this.me,
        selectedRole: this.selectedRole,
        pendingOtpChallenge: this.pendingOtpChallenge,
        pendingForgotPassword: this.pendingForgotPassword
      })
    },
    setSelectedRole(role: ClientRole) {
      this.selectedRole = role
      this.syncPersisted()
    },
    clearError() {
      this.errorCode = null
      this.errorMessage = null
    },
    captureError(error: unknown, fallback: string) {
      const code = error && typeof error === 'object' && 'code' in error ? String((error as { code?: string }).code || '') : null
      this.errorCode = code || null
      this.errorMessage = getAuthErrorMessage(error, fallback)
    },
    hydrate() {
      if (this.hydrated) return

      const persisted = readPersisted()
      if (persisted) {
        this.accessToken = persisted.accessToken
        this.currentUser = persisted.currentUser
        this.roles = persisted.roles
        this.me = persisted.me
        this.selectedRole = persisted.selectedRole || DEFAULT_CLIENT_ROLE
        this.pendingOtpChallenge = persisted.pendingOtpChallenge
        this.pendingForgotPassword = persisted.pendingForgotPassword
      }

      this.hydrated = true
    },
    async requestOtp(email: string, purpose: OtpPurpose) {
      this.clearError()
      this.loadingStates.otp = true
      try {
        await requestOtpApi({ email, purpose })
        this.pendingOtpChallenge = { email, purpose }
        if (purpose === 'forgot_password') {
          this.pendingForgotPassword = { email, verificationToken: null }
        } else {
          this.selectedRole = purpose === 'signup_artist' ? 'ARTIST' : 'BUYER'
        }
        this.syncPersisted()
      } catch (error) {
        this.captureError(error, 'Không thể gửi mã OTP. Vui lòng thử lại.')
        throw error
      } finally {
        this.loadingStates.otp = false
      }
    },
    async verifyOtp(code: string, challenge?: PendingOtpChallenge): Promise<string> {
      const activeChallenge = challenge || this.pendingOtpChallenge
      if (!activeChallenge) {
        throw new Error('Không có yêu cầu OTP nào đang chờ.')
      }

      this.clearError()
      this.loadingStates.otp = true
      try {
        const res = await verifyOtpApi({
          email: activeChallenge.email,
          purpose: activeChallenge.purpose,
          code
        })

        this.pendingOtpChallenge = activeChallenge
        if (activeChallenge.purpose === 'forgot_password') {
          this.pendingForgotPassword = {
            email: activeChallenge.email,
            verificationToken: res.data.verificationToken
          }
        }
        this.syncPersisted()
        return res.data.verificationToken
      } catch (error) {
        this.captureError(error, 'Mã OTP không hợp lệ hoặc đã hết hạn.')
        throw error
      } finally {
        this.loadingStates.otp = false
      }
    },
    async registerBuyer(input: Omit<RegisterBuyerInput, 'email'> & { email?: string }) {
      const email = input.email || this.pendingOtpChallenge?.email
      if (!email) {
        throw new Error('Không xác định được email đăng ký Buyer.')
      }

      this.clearError()
      this.loadingStates.register = true
      try {
        const res = await registerBuyerApi({
          email,
          password: input.password,
          fullName: input.fullName,
          phoneNumber: input.phoneNumber,
          verificationToken: input.verificationToken
        })
        this.applyLogin(res.data)
        this.pendingOtpChallenge = null
        this.pendingForgotPassword = null
        await this.hydrateMe()
      } catch (error) {
        this.captureError(error, 'Không thể hoàn tất đăng ký Buyer.')
        throw error
      } finally {
        this.loadingStates.register = false
        this.syncPersisted()
      }
    },
    async registerArtist(input: Omit<RegisterArtistInput, 'email'> & { email?: string }) {
      const email = input.email || this.pendingOtpChallenge?.email
      if (!email) {
        throw new Error('Không xác định được email đăng ký Artist.')
      }

      this.clearError()
      this.loadingStates.register = true
      try {
        const res = await registerArtistApi({
          email,
          password: input.password,
          fullName: input.fullName,
          phoneNumber: input.phoneNumber,
          verificationToken: input.verificationToken
        })
        this.applyLogin(res.data)
        this.pendingOtpChallenge = null
        this.pendingForgotPassword = null
        await this.hydrateMe()
      } catch (error) {
        this.captureError(error, 'Không thể hoàn tất đăng ký Artist.')
        throw error
      } finally {
        this.loadingStates.register = false
        this.syncPersisted()
      }
    },
    async loginWithPassword(email: string, password: string, requestedRole?: ClientRole) {
      this.clearError()
      this.loadingStates.login = true
      try {
        if (requestedRole) {
          this.selectedRole = requestedRole
        }
        const res = await loginApi({ email, password, requestedRole })
        this.applyLogin(res.data)
        await this.hydrateMe()
      } catch (error) {
        this.captureError(error, 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.')
        throw error
      } finally {
        this.loadingStates.login = false
        this.syncPersisted()
      }
    },
    async loginWithGoogle(firebaseIdToken: string) {
      this.clearError()
      this.loadingStates.google = true
      try {
        this.selectedRole = 'BUYER'
        const res = await loginGoogleApi({ firebaseIdToken })
        this.applyLogin(res.data)
        await this.hydrateMe()
      } catch (error) {
        this.captureError(error, 'Đăng nhập Google thất bại.')
        this.syncPersisted()
        throw error
      } finally {
        this.loadingStates.google = false
      }
    },
    async requestForgotPassword(email: string) {
      this.clearError()
      this.loadingStates.forgotPassword = true
      try {
        await forgotPasswordRequestApi({ email })
        this.pendingForgotPassword = { email }
        this.pendingOtpChallenge = { email, purpose: 'forgot_password' }
        this.syncPersisted()
      } catch (error) {
        this.captureError(error, 'Không thể gửi yêu cầu đặt lại mật khẩu.')
        throw error
      } finally {
        this.loadingStates.forgotPassword = false
      }
    },
    async confirmForgotPassword(input: { email?: string; verificationToken?: string; newPassword: string }) {
      const email = input.email || this.pendingForgotPassword?.email || this.pendingOtpChallenge?.email
      if (!email) {
        throw new Error('Không xác định được email để đặt lại mật khẩu.')
      }
      const verificationToken = input.verificationToken || this.pendingForgotPassword?.verificationToken
      if (!verificationToken) {
        throw new Error('Không tìm thấy xác nhận OTP hợp lệ để đặt lại mật khẩu.')
      }

      this.clearError()
      this.loadingStates.forgotPassword = true
      try {
        await forgotPasswordConfirmApi({
          email,
          verificationToken,
          newPassword: input.newPassword
        })
        this.pendingForgotPassword = null
        this.pendingOtpChallenge = null
      } catch (error) {
        this.captureError(error, 'Không thể xác nhận đổi mật khẩu.')
        throw error
      } finally {
        this.loadingStates.forgotPassword = false
        this.syncPersisted()
      }
    },
    async hydrateMe() {
      if (!this.accessToken || this.loadingStates.hydrateMe) return

      this.loadingStates.hydrateMe = true
      try {
        const res = await getMeApi()
        this.me = res.data
        this.selectedRole = resolvePreferredClientRole(this.roles, this.selectedRole || DEFAULT_CLIENT_ROLE)
      } catch (error) {
        this.captureError(error, 'Không thể tải hồ sơ hiện tại.')
        throw error
      } finally {
        this.loadingStates.hydrateMe = false
        this.syncPersisted()
      }
    },
    applyLogin(data: LoginResponseData) {
      this.accessToken = data.accessToken
      this.currentUser = data.user

      const currentRole = isClientRole(data.user.roleName) ? data.user.roleName : null
      const roles = data.roles?.length ? data.roles : currentRole ? [currentRole] : []

      this.roles = roles
      this.selectedRole = resolvePreferredClientRole(roles, currentRole || this.selectedRole || DEFAULT_CLIENT_ROLE)

      this.hydrated = true
      this.syncPersisted()
    },
    logout() {
      this.accessToken = null
      this.currentUser = null
      this.roles = []
      this.me = null
      this.pendingOtpChallenge = null
      this.pendingForgotPassword = null
      this.selectedRole = DEFAULT_CLIENT_ROLE
      this.loadingStates = getDefaultLoadingStates()
      this.clearError()
      this.syncPersisted()
    }
  }
})
