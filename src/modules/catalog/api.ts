import { products as mockProducts } from '../../data/catalog'
import type { ProductsListMeta, ProductsListResponse, ProductDetail, ProductListItem, SignedUrl } from './types'
import { apiRequest, getApiBaseUrl } from '../../shared/api/http'
import { ApiError } from '../../shared/api/errors'
import { mockFlags } from '../../shared/api/mockFlags'
import { toInternalProductId, toPublicProductId } from './idMap'

function paginate<T>(items: T[], page: number, pageSize: number) {
  const totalItems = items.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * pageSize
  const slice = items.slice(start, start + pageSize)
  const meta: ProductsListMeta = {
    pagination: {
      page: safePage,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPrevPage: safePage > 1
    }
  }
  return { slice, meta }
}

function mapToListItem(p: any): ProductListItem {
  return {
    id: toPublicProductId(String(p.id)),
    productCode: p.isrc ? String(p.isrc) : `PROD-${String(p.id).slice(0, 6).padStart(6, '0')}`,
    title: p.title,
    thumbnailUrl: p.cover || null,
    artistDisplayName: p.artist
  }
}

function mapToDetail(p: any): ProductDetail {
  return {
    id: toPublicProductId(String(p.id)),
    productCode: p.isrc ? String(p.isrc) : `PROD-${String(p.id).slice(0, 6).padStart(6, '0')}`,
    title: p.title,
    description: p.description,
    genre: p.category,
    durationSeconds: typeof p.duration === 'number' ? Math.round(p.duration * 60) : undefined,
    thumbnailUrl: p.cover || null,
    artist: { id: p.artistId || p.artist, displayName: p.artist }
  }
}

export async function listProducts(input: { page?: number; pageSize?: number; q?: string; genre?: string }) {
  const baseUrl = getApiBaseUrl()
  const shouldMock = mockFlags.products || !baseUrl

  if (shouldMock) {
    const page = input.page || 1
    const pageSize = input.pageSize || 20
    if (page <= 0 || pageSize <= 0 || pageSize > 100) {
      throw new ApiError({ statusCode: 400, code: 'INVALID_PAGINATION', message: 'Invalid pagination parameters', requestId: 'mock', details: { page, pageSize } })
    }
    const q = (input.q || '').trim().toLowerCase()
    const genre = (input.genre || '').trim().toLowerCase()

    const filtered = (mockProducts as any[]).filter(p => {
      const matchQ = !q || String(p.title || '').toLowerCase().includes(q) || String(p.artist || '').toLowerCase().includes(q)
      const matchGenre = !genre || String(p.category || '').toLowerCase() === genre
      return matchQ && matchGenre
    })

    const { slice, meta } = paginate(filtered, page, pageSize)
    const data: ProductsListResponse = { items: slice.map(mapToListItem) }
    return { data, meta }
  }

  const res = await apiRequest<ProductsListResponse, ProductsListMeta>({
    path: '/products',
    method: 'GET',
    query: input
  })
  return { data: res.data, meta: res.meta }
}

export async function getProduct(productId: string) {
  const baseUrl = getApiBaseUrl()
  const shouldMock = mockFlags.products || !baseUrl

  if (shouldMock) {
    const internalId = toInternalProductId(productId)
    const found = (mockProducts as any[]).find(p => p.id === internalId)
    if (!found) throw new Error('NOT_FOUND')
    return { data: mapToDetail(found) }
  }

  const res = await apiRequest<ProductDetail>({ path: `/products/${productId}`, method: 'GET' })
  return { data: res.data }
}

export async function getProductThumbnailUrl(productId: string) {
  const baseUrl = getApiBaseUrl()
  const shouldMock = mockFlags.products || !baseUrl

  if (shouldMock) {
    const internalId = toInternalProductId(productId)
    const found = (mockProducts as any[]).find(p => p.id === internalId)
    const url = found?.cover
    if (!url) return { data: { url: '', expiresInSeconds: 0 } satisfies SignedUrl }
    return { data: { url, expiresInSeconds: 3600 } }
  }

  const res = await apiRequest<SignedUrl>({ path: `/products/${productId}/thumbnail-url`, method: 'GET' })
  return { data: res.data }
}

export async function getProductPlaybackUrl(productId: string) {
  const baseUrl = getApiBaseUrl()
  const shouldMock = mockFlags.products || !baseUrl

  if (shouldMock) {
    return { data: { url: '', expiresInSeconds: 0 } satisfies SignedUrl }
  }

  const res = await apiRequest<SignedUrl>({ path: `/products/${productId}/playback-url`, method: 'GET' })
  return { data: res.data }
}
