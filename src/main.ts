import { ViteSSG } from 'vite-ssg'
import { createPinia } from 'pinia'
import App from './App.vue'
import { routes } from './router'
import { ApiError } from './shared/api/errors'
import { setAccessTokenGetter } from './shared/api/http'
import { useAuthStore } from './modules/auth/auth.store'
import { installRouterGuards } from './app/routerGuards'
import './styles/main.css'

export const createApp = ViteSSG(
  App,
  { routes },
  ({ app, router }) => {
    const pinia = createPinia()
    app.use(pinia)

    const auth = useAuthStore(pinia)
    setAccessTokenGetter(() => auth.accessToken)
    if (!import.meta.env.SSR) {
      auth.hydrate()
      if (auth.accessToken) {
        auth.hydrateMe().catch((error) => {
          if (error instanceof ApiError && (error.statusCode === 401 || error.statusCode === 403)) {
            auth.logout()
          }
        })
      }
    }
    if (router) installRouterGuards({ router, auth })
  },
  { hydration: true, useHead: true }
)
