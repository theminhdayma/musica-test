/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_USE_MOCK_PRODUCTS?: string
  readonly VITE_USE_MOCK_PURCHASE?: string
  readonly VITE_USE_MOCK_CERTIFICATES?: string
  readonly VITE_USE_MOCK_ME_PRODUCTS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
