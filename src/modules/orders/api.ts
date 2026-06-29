import { apiRequest, getApiBaseUrl } from '../../shared/api/http'
import { ApiError } from '../../shared/api/errors'
import type {
  CreateOrderInput,
  CreatedOrderResponse,
  OrderDetailResponse,
  SepayCheckoutResponse
} from './types'

function getBaseUrlCandidates() {
  const baseUrl = getApiBaseUrl()
  const trimmed = baseUrl.replace(/\/$/, '')
  return [
    trimmed,
    ...(trimmed.endsWith('/api') ? [trimmed.slice(0, -4)] : [`${trimmed}/api`]),
  ].filter((v, i, arr) => v && arr.indexOf(v) === i)
}

export async function createOrder(input: CreateOrderInput, idempotencyKey: string) {
  const candidates = getBaseUrlCandidates()
  let lastError = null
  for (const candidate of candidates) {
    try {
      const res = await apiRequest<CreatedOrderResponse>({
        baseUrlOverride: candidate,
        path: '/orders',
        method: 'POST',
        body: {
          ...input,
          idempotencyKey
        }
      })
      return { data: res.data }
    } catch (err) {
      lastError = err
      if (err instanceof ApiError && err.statusCode === 404) continue
      throw err
    }
  }

  throw lastError
}

export async function getBuyerOrderDetail(orderId: string) {
  const candidates = getBaseUrlCandidates()
  let lastError = null

  for (const candidate of candidates) {
    try {
      const res = await apiRequest<OrderDetailResponse>({
        baseUrlOverride: candidate,
        path: `/orders/my/${orderId}`,
        method: 'GET'
      })
      return { data: res.data }
    } catch (err) {
      lastError = err
      if (err instanceof ApiError && err.statusCode === 404) continue
      throw err
    }
  }

  throw lastError
}

export async function sepayCheckout(input: { orderId: string; paymentMethod?: string }) {
  const candidates = getBaseUrlCandidates()
  let lastError = null

  for (const candidate of candidates) {
    try {
      const res = await apiRequest<SepayCheckoutResponse>({
        baseUrlOverride: candidate,
        path: '/payments/sepay/checkout',
        method: 'POST',
        body: input
      })
      return { data: res.data }
    } catch (err) {
      lastError = err
      if (err instanceof ApiError && err.statusCode === 404) continue
      throw err
    }
  }

  throw lastError
}
