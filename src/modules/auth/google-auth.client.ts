import { ApiError } from '../../shared/api/errors'

type FirebaseClientConfig = {
  apiKey: string
  authDomain: string
  projectId: string
  appId: string
  messagingSenderId?: string
  storageBucket?: string
}

function readFirebaseConfig(): FirebaseClientConfig | null {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID
  const appId = import.meta.env.VITE_FIREBASE_APP_ID

  if (!apiKey || !authDomain || !projectId || !appId) {
    return null
  }

  return {
    apiKey,
    authDomain,
    projectId,
    appId,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET
  }
}

function looksLikeJwtToken(value: unknown): value is string {
  return typeof value === 'string' && value.split('.').length === 3
}

type FirebaseAppModule = typeof import('firebase/app')
type FirebaseAuthModule = typeof import('firebase/auth')

let firebaseModulesPromise: Promise<{ app: FirebaseAppModule; auth: FirebaseAuthModule }> | null = null

async function loadFirebaseModules() {
  if (firebaseModulesPromise) {
    return firebaseModulesPromise
  }

  firebaseModulesPromise = (async () => {
    try {
      const [app, auth] = await Promise.all([import('firebase/app'), import('firebase/auth')])
      return { app, auth }
    } catch {
      firebaseModulesPromise = null
      throw new ApiError({
        statusCode: 500,
        code: 'GOOGLE_CLIENT_ERROR',
        message: 'Không thể tải thư viện đăng nhập Google trên frontend.'
      })
    }
  })()

  return firebaseModulesPromise
}

async function getFirebaseAppInstance() {
  const config = readFirebaseConfig()

  if (!config) {
    throw new ApiError({
      statusCode: 500,
      code: 'GOOGLE_CLIENT_NOT_CONFIGURED',
      message: 'Google Sign-In chưa được cấu hình trên frontend.'
    })
  }

  const { app } = await loadFirebaseModules()
  const { getApps, getApp, initializeApp } = app

  if (getApps().length > 0) {
    return getApp()
  }

  return initializeApp(config)
}

export function isGoogleClientConfigured() {
  return !!readFirebaseConfig()
}

export async function getFirebaseIdTokenFromGoogle() {
  try {
    const { auth: authModule } = await loadFirebaseModules()
    const { getAuth, GoogleAuthProvider, signInWithPopup, signOut } = authModule

    const app = await getFirebaseAppInstance()
    const auth = getAuth(app)
    const provider = new GoogleAuthProvider()

    provider.addScope('email')
    provider.addScope('profile')
    provider.setCustomParameters({ prompt: 'select_account' })

    const result = await signInWithPopup(auth, provider)

    let idTokenFromMethod: string | null = null
    const userWithTokenMethod = result.user as { getIdToken?: (forceRefresh?: boolean) => Promise<string> }
    if (typeof userWithTokenMethod.getIdToken === 'function') {
      try {
        idTokenFromMethod = await userWithTokenMethod.getIdToken(true)
      } catch {
        idTokenFromMethod = null
      }
    }

    const tokenCandidates = [
      { source: 'user.getIdToken', token: idTokenFromMethod },
      { source: 'user.accessToken', token: (result.user as { accessToken?: unknown }).accessToken },
      { source: 'credential._tokenResponse.idToken', token: (result as { _tokenResponse?: { idToken?: unknown } })._tokenResponse?.idToken }
    ]

    const selectedTokenCandidate = tokenCandidates.find(candidate => looksLikeJwtToken(candidate.token))
    const idToken = selectedTokenCandidate?.token ?? null

    await signOut(auth)

    if (!idToken) {
      throw new ApiError({
        statusCode: 500,
        code: 'GOOGLE_CLIENT_ERROR',
        message: 'Không thể lấy Firebase ID token từ Google.'
      })
    }

    return idToken
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    const firebaseError = error as { code?: string; message?: string }

    if (firebaseError.code === 'auth/popup-closed-by-user') {
      throw new ApiError({
        statusCode: 400,
        code: 'GOOGLE_POPUP_CLOSED',
        message: 'Bạn đã đóng cửa sổ đăng nhập Google trước khi hoàn tất.'
      })
    }

    throw new ApiError({
      statusCode: 500,
      code: 'GOOGLE_CLIENT_ERROR',
      message: firebaseError.message || 'Không thể lấy thông tin đăng nhập Google.'
    })
  }
}
