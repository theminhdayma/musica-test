export type QuoteRequest = {
  productId: string
  selection: unknown
}

export type QuoteResponse = {
  currency: string
  subtotal: number
  fees: number
  tax: number
  total: number
  breakdown?: unknown
}

