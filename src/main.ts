import { ViteSSG } from 'vite-ssg'
import { createPinia } from 'pinia'
import App from './App.vue'
import { routes } from './router'
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
    if (!import.meta.env.SSR) auth.hydrate()
    setAccessTokenGetter(() => auth.accessToken)
    if (router) installRouterGuards({ router, auth })
  },
  { hydration: true, useHead: true }
)
