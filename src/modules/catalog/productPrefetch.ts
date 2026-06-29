import type { ProductDetail } from './types'
import { getProduct } from './api'

const cache = new Map<string, Promise<ProductDetail>>()
const resolved = new Map<string, ProductDetail>()

export async function prefetchProduct(productId: string) {
  if (!productId) return
  if (resolved.has(productId)) return
  if (!cache.has(productId)) {
    cache.set(
      productId,
      getProduct(productId).then(res => {
        resolved.set(productId, res.data)
        cache.delete(productId)
        return res.data
      }),
    )
  }
  await cache.get(productId)
}

export function consumePrefetchedProduct(productId: string) {
  const value = resolved.get(productId)
  resolved.delete(productId)
  return value
}

