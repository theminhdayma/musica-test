import { defineStore } from 'pinia'
import type { AuthRole, AuthUser, LoginResponseData } from './types'
import { loginApi } from './auth.api'

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
    hydrated: false
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
    async login(input: { email: string; password: string; remember: boolean }) {
      const res = await loginApi({ email: input.email, password: input.password })
      this.applyLogin(res.data, input.remember)
    },
    applyLogin(data: LoginResponseData, remember: boolean) {
      this.accessToken = data.accessToken
      this.user = data.user
      this.roles = data.roles
      if (remember) {
        writePersisted({ accessToken: data.accessToken, user: data.user, roles: data.roles })
      } else {
        writePersisted(null)
      }
      this.hydrated = true
    },
    logout() {
      this.accessToken = null
      this.user = null
      this.roles = []
      writePersisted(null)
    }
  }
})
