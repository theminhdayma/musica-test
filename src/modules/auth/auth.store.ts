import { defineStore } from 'pinia'
import type { AuthRole, AuthUser, LoginResponseData, OtpPurpose, MeProfile } from './types'
import {
  loginApi,
  requestOtpApi,
  verifyOtpApi,
  registerBuyerApi,
  registerArtistApi,
  loginGoogleApi,
  linkGoogleApi,
  forgotPasswordRequestApi,
  forgotPasswordConfirmApi,
  getMeApi
} from './auth.api'

type PersistedAuth = {
  accessToken: string
  user: AuthUser
  roles: AuthRole[]
}

const STORAGE_KEY = 'musica_auth_v1'

function readPersisted(): PersistedAuth | null {
  if (typeof window === 'undefined' || !globalThis.sessionStorage) return null
  const raw = globalThis.sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as PersistedAuth
    if (!parsed?.accessToken) return null
    return parsed
  } catch {
    return null
  }
}

function writePersisted(v: PersistedAuth | null) {
  if (typeof window === 'undefined' || !globalThis.sessionStorage) return
  if (!v) {
    globalThis.sessionStorage.removeItem(STORAGE_KEY)
    return
  }
  globalThis.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(v))
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null as string | null,
    user: null as AuthUser | null,
    roles: [] as AuthRole[],
    me: null as MeProfile | null,
    hydrated: false,
    pendingOtpChallenge: null as { email: string; purpose: OtpPurpose } | null,
    pendingGoogleLink: null as { firebaseIdToken: string } | null,
    pendingForgotPassword: null as { email: string } | null
  }),
  getters: {
    isAuthenticated: (s) => !!s.accessToken
  },
  actions: {
    hydrate() {
      if (this.hydrated) return
      const persisted = readPersisted()
      if (persisted) {
        this.accessToken = persisted.accessToken
        this.user = persisted.user
        this.roles = persisted.roles
      }
      this.hydrated = true
    },
    async requestOtp(email: string, purpose: OtpPurpose) {
      await requestOtpApi({ email, purpose })
      this.pendingOtpChallenge = { email, purpose }
    },
    async verifyOtp(code: string): Promise<string> {
      if (!this.pendingOtpChallenge) {
        throw new Error('Không có yêu cầu OTP nào đang chờ')
      }
      const res = await verifyOtpApi({
        email: this.pendingOtpChallenge.email,
        purpose: this.pendingOtpChallenge.purpose,
        code
      })
      return res.data.verificationToken
    },
    async registerBuyer(input: Omit<RegisterBuyerInput, 'email'>) {
      if (!this.pendingOtpChallenge) {
        throw new Error('Không có yêu cầu đăng ký nào đang chờ')
      }
      const res = await registerBuyerApi({
        email: this.pendingOtpChallenge.email,
        ...input
      })
      this.applyLogin(res.data, true)
      this.pendingOtpChallenge = null
      await this.hydrateMe()
    },
    async registerArtist(input: Omit<RegisterArtistInput, 'email'>) {
      if (!this.pendingOtpChallenge) {
        throw new Error('Không có yêu cầu đăng ký nào đang chờ')
      }
      const res = await registerArtistApi({
        email: this.pendingOtpChallenge.email,
        ...input
      })
      this.applyLogin(res.data, true)
      this.pendingOtpChallenge = null
      await this.hydrateMe()
    },
    async loginWithPassword(email: string, password: string, requestedRole: 'BUYER' | 'ARTIST', remember = true) {
      const res = await loginApi({ email, password, requestedRole })
      this.applyLogin(res.data, remember)
      await this.hydrateMe()
    },
    async loginWithGoogle(firebaseIdToken: string) {
      try {
        const res = await loginGoogleApi({ firebaseIdToken })
        this.applyLogin(res.data, true)
        await this.hydrateMe()
      } catch (e: any) {
        // Nếu email đã đăng ký bằng password -> Trả challenge để link Google
        if (e && e.code === 'PROVIDER_MISMATCH') {
          this.pendingGoogleLink = { firebaseIdToken }
        }
        throw e;
      }
    },
    async linkGoogle(verificationToken: string) {
      if (!this.pendingGoogleLink) {
        throw new Error('Không có yêu cầu liên kết Google nào đang chờ')
      }
      await linkGoogleApi({
        firebaseIdToken: this.pendingGoogleLink.firebaseIdToken,
        verificationToken
      })
      this.pendingGoogleLink = null
      this.pendingOtpChallenge = null
    },
    async requestForgotPassword(email: string) {
      await forgotPasswordRequestApi({ email })
      this.pendingForgotPassword = { email }
      this.pendingOtpChallenge = { email, purpose: 'forgot_password' }
    },
    async confirmForgotPassword(code: string, newPassword: string) {
      if (!this.pendingForgotPassword) {
        throw new Error('Không có yêu cầu quên mật khẩu nào đang chờ')
      }
      await forgotPasswordConfirmApi({
        email: this.pendingForgotPassword.email,
        code,
        newPassword
      })
      this.pendingForgotPassword = null
      this.pendingOtpChallenge = null
    },
    async hydrateMe() {
      if (!this.accessToken) return
      const res = await getMeApi()
      this.me = res.data
    },
    applyLogin(data: LoginResponseData, remember: boolean) {
      this.accessToken = data.accessToken
      this.user = data.user
      // Cập nhật array roles từ role của user
      this.roles = data.roles || (data.user.roles as any) || []
      if (remember) {
        writePersisted({ accessToken: data.accessToken, user: data.user, roles: this.roles })
      } else {
        writePersisted(null)
      }
      this.hydrated = true
    },
    logout() {
      this.accessToken = null
      this.user = null
      this.roles = []
      this.me = null
      this.pendingOtpChallenge = null
      this.pendingGoogleLink = null
      this.pendingForgotPassword = null
      writePersisted(null)
    }
  }
})
