import { defineStore } from 'pinia'
import { ApiError } from '../shared/api/errors'
import {
  addCartItem,
  getMyCart,
  removeCartItem,
  removeManyCartItems,
  updateCartItem,
} from '../modules/cart/api'

const LEGACY_CART_STORAGE_KEY = 'musica.cart.items'
const LEGACY_CART_SELECTION_KEY = 'musica.cart.selection'
const AUTH_STORAGE_KEY = 'musica_auth_v2'
let syncPromise = null

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: loadCartItems(),
    selectedLineIds: loadSelectedLineIds(),
    loading: false,
    hydrated: false,
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
    async syncAuthState() {
      const persistedAuth = readPersistedAuth()
      if (!persistedAuth?.accessToken || !persistedAuth?.currentUser?.id) {
        this.items = []
        this.selectedLineIds = []
        this.loading = false
        this.hydrated = true
        persistSelectedLineIds(this.selectedLineIds)
        return
      }

      if (syncPromise) return syncPromise

      syncPromise = (async () => {
        this.loading = true
        try {
          const res = await getMyCart()
          this.items = normalizeServerCartItems(res.data?.items || [])
          persistCartItems(this.items)
        } catch {
          this.items = loadCartItems()
        } finally {
          this.selectedLineIds = normalizeSelectedLineIds(loadSelectedLineIds(), this.items)
          persistSelectedLineIds(this.selectedLineIds)
          this.loading = false
          this.hydrated = true
          syncPromise = null
        }
      })()

      return syncPromise
    },
    async add(item) {
      try {
        const res = await addCartItem(toCartPayload(item))
        const normalizedItem = normalizeServerCartItem(res.data)
        const existingIndex = this.items.findIndex((entry) => entry.lineId === normalizedItem.lineId)
        if (existingIndex >= 0) {
          this.items.splice(existingIndex, 1, normalizedItem)
        } else {
          this.items.unshift(normalizedItem)
        }
        persistCartItems(this.items)
        this.selectedLineIds = normalizeSelectedLineIds(
          [...this.selectedLineIds, normalizedItem.lineId],
          this.items
        )
        persistSelectedLineIds(this.selectedLineIds)
        return { ok: true }
      } catch (error) {
        if (error instanceof ApiError && error.code === 'CART_ITEM_ALREADY_EXISTS') {
          return { ok: false, reason: 'duplicate' }
        }
        throw error
      }
    },
    async update(lineId, patch) {
      const index = this.items.findIndex((item) => item.lineId === lineId)
      if (index < 0) return { ok: false, reason: 'not_found' }

      try {
        const res = await updateCartItem(lineId, toCartPayload({
          ...this.items[index],
          ...patch,
        }))
        const nextItem = normalizeServerCartItem(res.data)
        this.items.splice(index, 1, nextItem)
        persistCartItems(this.items)
        this.selectedLineIds = normalizeSelectedLineIds(this.selectedLineIds, this.items)
        persistSelectedLineIds(this.selectedLineIds)
        return { ok: true }
      } catch (error) {
        if (error instanceof ApiError && error.code === 'CART_ITEM_ALREADY_EXISTS') {
          return { ok: false, reason: 'duplicate' }
        }
        throw error
      }
    },
    async remove(lineId) {
      await removeCartItem(lineId)
      this.items = this.items.filter(i => i.lineId !== lineId)
      this.selectedLineIds = normalizeSelectedLineIds(
        this.selectedLineIds.filter((id) => id !== lineId),
        this.items
      )
      persistCartItems(this.items)
      persistSelectedLineIds(this.selectedLineIds)
    },
    async removeMany(lineIds) {
      const normalizedIds = [...new Set((lineIds || []).map((item) => String(item || '').trim()))]
        .filter(Boolean)
      if (!normalizedIds.length) return { ok: true, removedIds: [] }

      const res = await removeManyCartItems(normalizedIds)
      const removedSet = new Set(res.data?.removedIds || [])
      this.items = this.items.filter((item) => !removedSet.has(item.lineId))
      this.selectedLineIds = normalizeSelectedLineIds(
        this.selectedLineIds.filter((id) => !removedSet.has(id)),
        this.items
      )
      persistCartItems(this.items)
      persistSelectedLineIds(this.selectedLineIds)
      return { ok: true, removedIds: [...removedSet] }
    },
    async clear() {
      if (this.items.length > 0) {
        await this.removeMany(this.items.map((item) => item.lineId))
        return
      }
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
    lineId: String(item?.lineId || item?.id || '').trim() || cryptoRandomId(),
    qty: Number(item?.qty || 1),
    price: Number(item?.price || 0),
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

function normalizeServerCartItems(items) {
  return (items || []).map((item) => normalizeServerCartItem(item))
}

function normalizeServerCartItem(item) {
  return normalizeCartItem({
    lineId: item?.id,
    productId: item?.productId,
    title: item?.title,
    artist: item?.artist,
    cover: item?.thumbnailUrl,
    price: item?.price,
    currency: item?.currency,
    qty: item?.qty || 1,
    configuration: item?.configuration,
    selectedUsageRights: item?.selectedUsageRights,
    pricingAttributes: item?.pricingAttributes,
    platformName: item?.platformName,
    createdAt: item?.createdAt,
    updatedAt: item?.updatedAt,
  })
}

function toCartPayload(item) {
  return {
    productId: String(item?.productId || '').trim(),
    selectedUsageRights: normalizeStringArray(item?.selectedUsageRights),
    pricingAttributes: normalizePricingAttributes(item?.pricingAttributes),
  }
}

function cryptoRandomId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}
