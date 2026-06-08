import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { products } from './src/data/catalog.js'

function stableUuidFromString(input) {
  let h = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }

  const bytes = new Uint8Array(16)
  let x = h >>> 0
  for (let i = 0; i < 16; i += 1) {
    x ^= x << 13
    x ^= x >>> 17
    x ^= x << 5
    bytes[i] = x & 0xff
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80

  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    open: false
  },
  ssgOptions: {
    formatting: 'minify',
    includedRoutes(paths) {
      const internalProductPaths = (products || []).slice(0, 50).map(p => `/product/${p.id}`)
      const publicProductPaths = (products || []).slice(0, 50).map(p => `/product/${stableUuidFromString(`product:${String(p.id)}`)}`)
      const staticPaths = paths.filter(p => !p.includes(':'))
      return [...new Set([...staticPaths, '/search', ...internalProductPaths, ...publicProductPaths])]
    }
  }
})
