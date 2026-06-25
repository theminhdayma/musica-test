import { ViteSSG } from 'vite-ssg'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ConfirmationService from 'primevue/confirmationservice'
import Aura from '@primevue/themes/aura'
import FloatingVue from 'floating-vue'
import App from './App.vue'
import { routes } from './router'
import { ApiError } from './shared/api/errors'
import { setAccessTokenGetter } from './shared/api/http'
import { useAuthStore } from './modules/auth/auth.store'
import { installRouterGuards } from './app/routerGuards'
import './styles/main.css'
import './styles/admin-vars.css'
import 'primeicons/primeicons.css'
import 'floating-vue/dist/style.css'

export const createApp = ViteSSG(
  App,
  {
    routes,
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) return savedPosition
      if (to.hash) return { el: to.hash }
      return { left: 0, top: 0 }
    }
  },
  ({ app, router }) => {
    const pinia = createPinia()
    app.use(pinia)
    app.use(PrimeVue, {
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.app-dark'
        }
      }
    })
    app.use(ConfirmationService)
    app.use(FloatingVue, {
      themes: {
        'artist-hint': {
          $extend: 'tooltip',
          delay: { show: 0, hide: 100 },
          placement: 'right',
          distance: 12,
        },
      },
    })

    const auth = useAuthStore(pinia)
    setAccessTokenGetter(() => auth.accessToken)
    if (!import.meta.env.SSR) {
      try {
        document.documentElement.classList.remove('app-dark')
        localStorage.removeItem('app-dark')
      } catch {
      }
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
