import { products as mockProducts } from '../../data/catalog'
import type { ProductsListMeta, ProductsListResponse, ProductDetail, SignedUrl } from './types'
import { apiRequest, getApiBaseUrl } from '../../shared/api/http'
import { mockFlags } from '../../shared/api/mockFlags'
import { toInternalProductId, toPublicProductId } from './idMap'

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

export async function listProducts(input: {
  page?: number
  pageSize?: number
  q?: string
  genre?: string
  useCase?: string
  duration?: 'lt2' | '2to4' | 'gt4'
  sort?: 'createdAt:desc' | 'createdAt:asc' | 'updatedAt:desc' | 'updatedAt:asc' | 'title:asc' | 'title:desc' | 'genre:asc' | 'genre:desc' | 'duration:asc' | 'duration:desc'
}) {
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

  const res = await apiRequest<ProductDetail>({ path: `/marketplace/products/${productId}`, method: 'GET' })
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

export async function getExpressionConfigs() {
  const res = await apiRequest<any>({ path: `/public/configs/expressions`, method: 'GET' })
  return res.data
}

export async function getModificationConfigs() {
  const res = await apiRequest<any>({ path: `/public/configs/modifications`, method: 'GET' })
  return res.data
}

export async function calculateVariantPricing(payload: any) {
  const res = await apiRequest<any>({
    path: `/public/variant-pricing/calculate`,
    method: 'POST',
    body: payload
  })
  return res.data
}
