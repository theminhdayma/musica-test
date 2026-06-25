import { apiRequest, getApiBaseUrl } from '../../shared/api/http'
import { ApiError } from '../../shared/api/errors'
import type { CreateOrderInput, CreatedOrderResponse } from './types'

export async function createOrder(input: CreateOrderInput, idempotencyKey: string) {
  const baseUrl = getApiBaseUrl()
  const trimmed = baseUrl.replace(/\/$/, '')
  const candidates = [
    trimmed,
    ...(trimmed.endsWith('/api') ? [trimmed.slice(0, -4)] : [`${trimmed}/api`]),
  ].filter((v, i, arr) => v && arr.indexOf(v) === i)

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
