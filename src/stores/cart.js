import { defineStore } from 'pinia'

const CART_STORAGE_KEY = 'musica.cart.items'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: loadCartItems()
  }),
  getters: {
    subtotal: (s) => s.items.reduce((sum, it) => sum + it.price * it.qty, 0),
    fee: (s) => Math.round(s.items.reduce((sum, it) => sum + it.price * it.qty, 0) * 0.04),
    total(state) {
      return this.subtotal + this.fee
    },
    count: (s) => s.items.reduce((n, i) => n + i.qty, 0)
  },
  actions: {
    add(item) {
      const normalizedItem = normalizeCartItem({
        ...item,
        qty: 1,
        lineId: cryptoRandomId()
      })
      const signature = getCartItemSignature(normalizedItem)
      const hasDuplicate = this.items.some((existing) => (
        getCartItemSignature(existing) === signature
      ))

      if (hasDuplicate) {
        return { ok: false, reason: 'duplicate' }
      }

      this.items.push(normalizedItem)
      persistCartItems(this.items)
      return { ok: true }
    },
    update(lineId, patch) {
      const index = this.items.findIndex((item) => item.lineId === lineId)
      if (index < 0) return { ok: false, reason: 'not_found' }

      const nextItem = normalizeCartItem({
        ...this.items[index],
        ...patch,
        qty: 1,
        lineId
      })
      const signature = getCartItemSignature(nextItem)
      const hasDuplicate = this.items.some((existing) => (
        existing.lineId !== lineId && getCartItemSignature(existing) === signature
      ))
      if (hasDuplicate) return { ok: false, reason: 'duplicate' }

      this.items.splice(index, 1, nextItem)
      persistCartItems(this.items)
      return { ok: true }
    },
    remove(lineId) {
      this.items = this.items.filter(i => i.lineId !== lineId)
      persistCartItems(this.items)
    },
    clear() {
      this.items = []
      persistCartItems(this.items)
    }
  }
})

function cryptoRandomId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function loadCartItems() {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const uniqueItems = []
    const seen = new Set()

    for (const item of parsed
      .filter((item) => item && typeof item === 'object' && item.productId)
      .map((item) => ({
        ...item
      }))) {
      const normalizedItem = normalizeCartItem(item)
      const signature = getCartItemSignature(normalizedItem)
      if (seen.has(signature)) continue
      seen.add(signature)
      uniqueItems.push(normalizedItem)
    }

    return uniqueItems
  } catch {
    return []
  }
}

function persistCartItems(items) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items || []))
  } catch {
  }
}

function normalizeCartItem(item) {
  return {
    ...item,
    configuration: item.configuration && typeof item.configuration === 'object' ? item.configuration : {},
    selectedUsageRights: normalizeStringArray(item.selectedUsageRights),
    pricingAttributes: normalizePricingAttributes(item.pricingAttributes),
  }
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) return []
  return [...new Set(
    value
      .map((item) => String(item || '').trim())
      .filter((item) => item.length > 0)
  )].sort()
}

function normalizePricingAttributes(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return Object.fromEntries(
    Object.entries(value)
      .map(([key, itemValue]) => [String(key), itemValue == null ? '' : String(itemValue)])
      .sort(([left], [right]) => left.localeCompare(right))
  )
}

function getCartItemSignature(item) {
  return JSON.stringify({
    productId: String(item?.productId || ''),
    selectedUsageRights: normalizeStringArray(item?.selectedUsageRights),
    pricingAttributes: normalizePricingAttributes(item?.pricingAttributes),
  })
}
