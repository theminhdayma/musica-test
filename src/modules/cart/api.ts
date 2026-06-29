import { apiRequest, getApiBaseUrl } from '../../shared/api/http'
import type {
  BuyerCartItem,
  BuyerCartResponse,
  RemoveBuyerCartItemsResponse,
  UpsertBuyerCartItemInput,
} from './types'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

function getBaseUrlCandidates() {
  const baseUrl = getApiBaseUrl()
  const trimmed = baseUrl.replace(/\/$/, '')
  return [
    trimmed,
    ...(trimmed.endsWith('/api') ? [trimmed.slice(0, -4)] : [`${trimmed}/api`]),
  ].filter((value, index, items) => value && items.indexOf(value) === index)
}

async function requestWithCandidates<T>(path: string, method: HttpMethod, body?: unknown) {
  const candidates = getBaseUrlCandidates()
  let lastError: unknown = null

  for (const candidate of candidates) {
    try {
      const res = await apiRequest<T>({
        baseUrlOverride: candidate,
        path,
        method,
        body,
      })
      return { data: res.data }
    } catch (error) {
      lastError = error
      throw error
    }
  }

  throw lastError
}

export async function getMyCart() {
  return requestWithCandidates<BuyerCartResponse>('/cart/my', 'GET')
}

export async function addCartItem(input: UpsertBuyerCartItemInput) {
  return requestWithCandidates<BuyerCartItem>('/cart/items', 'POST', input)
}

export async function updateCartItem(itemId: string, input: UpsertBuyerCartItemInput) {
  return requestWithCandidates<BuyerCartItem>(`/cart/items/${itemId}`, 'PATCH', input)
}

export async function removeCartItem(itemId: string) {
  return requestWithCandidates<RemoveBuyerCartItemsResponse>(`/cart/items/${itemId}`, 'DELETE')
}

export async function removeManyCartItems(itemIds: string[]) {
  return requestWithCandidates<RemoveBuyerCartItemsResponse>('/cart/items/remove-many', 'POST', {
    itemIds,
  })
}
