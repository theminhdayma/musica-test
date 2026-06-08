import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: []
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
      // Each tac quyen configuration is unique, so keep a separate cart line.
      this.items.push({ ...item, qty: 1, lineId: cryptoRandomId() })
    },
    remove(lineId) {
      this.items = this.items.filter(i => i.lineId !== lineId)
    },
    clear() { this.items = [] }
  }
})

function cryptoRandomId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}
