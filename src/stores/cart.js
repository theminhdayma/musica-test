import { defineStore } from 'pinia'

const LEGACY_CART_STORAGE_KEY = 'musica.cart.items'
const LEGACY_CART_SELECTION_KEY = 'musica.cart.selection'
const AUTH_STORAGE_KEY = 'musica_auth_v2'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: loadCartItems(),
    selectedLineIds: loadSelectedLineIds()
  }),
  getters: {
    subtotal: (s) => s.items.reduce((sum, it) => sum + it.price * it.qty, 0),
    fee: (s) => Math.round(s.items.reduce((sum, it) => sum + it.price * it.qty, 0) * 0.04),
    total(state) {
      return this.subtotal + this.fee
    },
    count: (s) => s.items.reduce((n, i) => n + i.qty, 0),
    selectedItems(state) {
      const selectedSet = new Set(state.selectedLineIds)
      return state.items.filter((item) => selectedSet.has(item.lineId))
    },
    selectedSubtotal() {
      return this.selectedItems.reduce((sum, it) => sum + it.price * it.qty, 0)
    },
    selectedFee() {
      return Math.round(this.selectedSubtotal * 0.04)
    },
    selectedTotal() {
      return this.selectedSubtotal + this.selectedFee
    },
    selectedCount() {
      return this.selectedItems.reduce((n, i) => n + i.qty, 0)
    },
    allSelected(state) {
      return state.items.length > 0 && state.items.every((item) => state.selectedLineIds.includes(item.lineId))
    },
    hasSelection() {
      return this.selectedItems.length > 0
    }
  },
  actions: {
    syncAuthState() {
      this.items = loadCartItems()
      this.selectedLineIds = normalizeSelectedLineIds(loadSelectedLineIds(), this.items)
      persistSelectedLineIds(this.selectedLineIds)
    },
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
      this.selectedLineIds = normalizeSelectedLineIds(
        [...this.selectedLineIds, normalizedItem.lineId],
        this.items
      )
      persistSelectedLineIds(this.selectedLineIds)
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
      this.selectedLineIds = normalizeSelectedLineIds(this.selectedLineIds, this.items)
      persistSelectedLineIds(this.selectedLineIds)
      return { ok: true }
    },
    remove(lineId) {
      this.items = this.items.filter(i => i.lineId !== lineId)
      this.selectedLineIds = normalizeSelectedLineIds(
        this.selectedLineIds.filter((id) => id !== lineId),
        this.items
      )
      persistCartItems(this.items)
      persistSelectedLineIds(this.selectedLineIds)
    },
    clear() {
      this.items = []
      this.selectedLineIds = []
      persistCartItems(this.items)
      persistSelectedLineIds(this.selectedLineIds)
    },
    toggleSelection(lineId) {
      if (!this.items.some((item) => item.lineId === lineId)) return
      const selected = this.selectedLineIds.includes(lineId)
      this.selectedLineIds = selected
        ? this.selectedLineIds.filter((id) => id !== lineId)
        : [...this.selectedLineIds, lineId]
      this.selectedLineIds = normalizeSelectedLineIds(this.selectedLineIds, this.items)
      persistSelectedLineIds(this.selectedLineIds)
    },
    selectAll() {
      this.selectedLineIds = this.items.map((item) => item.lineId)
      persistSelectedLineIds(this.selectedLineIds)
    },
    clearSelection() {
      this.selectedLineIds = []
      persistSelectedLineIds(this.selectedLineIds)
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
    const storageKey = resolveCartStorageKey()
    if (!storageKey) {
      window.localStorage.removeItem(LEGACY_CART_STORAGE_KEY)
      return []
    }

    const raw = window.localStorage.getItem(storageKey)
      || window.localStorage.getItem(LEGACY_CART_STORAGE_KEY)
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

    if (
      storageKey !== LEGACY_CART_STORAGE_KEY &&
      window.localStorage.getItem(LEGACY_CART_STORAGE_KEY)
      && !window.localStorage.getItem(storageKey)
    ) {
      window.localStorage.setItem(storageKey, JSON.stringify(uniqueItems))
      window.localStorage.removeItem(LEGACY_CART_STORAGE_KEY)
    }

    return uniqueItems
  } catch {
    return []
  }
}

function loadSelectedLineIds() {
  if (typeof window === 'undefined') return []
  try {
    const storageKey = resolveCartSelectionStorageKey()
    if (!storageKey) {
      window.localStorage.removeItem(LEGACY_CART_SELECTION_KEY)
      return []
    }

    const raw = window.localStorage.getItem(storageKey)
      || window.localStorage.getItem(LEGACY_CART_SELECTION_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    const normalized = [...new Set(
      parsed
        .map((item) => String(item || '').trim())
        .filter(Boolean)
    )]

    if (
      storageKey !== LEGACY_CART_SELECTION_KEY &&
      window.localStorage.getItem(LEGACY_CART_SELECTION_KEY)
      && !window.localStorage.getItem(storageKey)
    ) {
      window.localStorage.setItem(storageKey, JSON.stringify(normalized))
      window.localStorage.removeItem(LEGACY_CART_SELECTION_KEY)
    }

    return normalized
  } catch {
    return []
  }
}

function persistCartItems(items) {
  if (typeof window === 'undefined') return
  try {
    const storageKey = resolveCartStorageKey()
    if (!storageKey) {
      window.localStorage.removeItem(LEGACY_CART_STORAGE_KEY)
      return
    }
    window.localStorage.setItem(storageKey, JSON.stringify(items || []))
    if (storageKey !== LEGACY_CART_STORAGE_KEY) {
      window.localStorage.removeItem(LEGACY_CART_STORAGE_KEY)
    }
  } catch {
  }
}

function persistSelectedLineIds(selectedLineIds) {
  if (typeof window === 'undefined') return
  try {
    const storageKey = resolveCartSelectionStorageKey()
    if (!storageKey) {
      window.localStorage.removeItem(LEGACY_CART_SELECTION_KEY)
      return
    }
    window.localStorage.setItem(storageKey, JSON.stringify(selectedLineIds || []))
    if (storageKey !== LEGACY_CART_SELECTION_KEY) {
      window.localStorage.removeItem(LEGACY_CART_SELECTION_KEY)
    }
  } catch {
  }
}

function resolveCartStorageKey() {
  const auth = readPersistedAuth()
  const userId = String(auth?.currentUser?.id || '').trim()
  if (!auth?.accessToken || !userId) return null
  return `${LEGACY_CART_STORAGE_KEY}.${userId}`
}

function resolveCartSelectionStorageKey() {
  const auth = readPersistedAuth()
  const userId = String(auth?.currentUser?.id || '').trim()
  if (!auth?.accessToken || !userId) return null
  return `${LEGACY_CART_SELECTION_KEY}.${userId}`
}

function readPersistedAuth() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    return parsed
  } catch {
    return null
  }
}

function normalizeCartItem(item) {
  return {
    ...item,
    artist: normalizeArtistName(item),
    cover: normalizeCoverValue(item),
    configuration: item.configuration && typeof item.configuration === 'object' ? item.configuration : {},
    selectedUsageRights: normalizeStringArray(item.selectedUsageRights),
    pricingAttributes: normalizePricingAttributes(item.pricingAttributes),
  }
}

function normalizeSelectedLineIds(selectedLineIds, items) {
  const allowed = new Set((items || []).map((item) => item.lineId))
  const existing = [...new Set(
    (selectedLineIds || [])
      .map((item) => String(item || '').trim())
      .filter((item) => allowed.has(item))
  )]

  if (existing.length > 0) return existing
  return (items || []).map((item) => item.lineId)
}

function normalizeArtistName(item) {
  return String(
    item?.artist
    || item?.artistDisplayName
    || item?.authorName
    || item?.artistName
    || item?.artist?.displayName
    || 'Nghệ sĩ'
  ).trim()
}

function normalizeCoverValue(item) {
  return String(item?.cover || item?.thumbnailUrl || '').trim()
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
