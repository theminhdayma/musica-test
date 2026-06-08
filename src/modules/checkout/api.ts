import { apiRequest, getApiBaseUrl } from '../../shared/api/http'
import { mockFlags } from '../../shared/api/mockFlags'
import type { QuoteRequest, QuoteResponse } from './types'
import { products as mockProducts } from '../../data/catalog'

function computeMockQuote(productId: string): QuoteResponse {
  const p = (mockProducts as any[]).find(x => x.id === productId)
  const base = Number(p?.basePrice || 0)
  const subtotal = Math.round(base)
  const fees = Math.round(subtotal * 0.04)
  const tax = 0
  const total = subtotal + fees + tax
  return { currency: 'VND', subtotal, fees, tax, total }
}

export async function quote(input: QuoteRequest) {
  const baseUrl = getApiBaseUrl()
  const shouldMock = mockFlags.purchase || !baseUrl

  if (shouldMock) {
    return { data: computeMockQuote(input.productId) }
  }

  const res = await apiRequest<QuoteResponse>({
    path: '/checkout/quote',
    method: 'POST',
    body: input
  })
  return { data: res.data }
}

