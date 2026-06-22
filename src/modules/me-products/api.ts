import { products as mockProducts } from '../../data/catalog'
import { apiRequest, getApiBaseUrl } from '../../shared/api/http'
import { mockFlags } from '../../shared/api/mockFlags'
import type { MyProductDetail, MyProductsListMeta, MyProductsListResponse } from './types'

type ApiProduct = {
  id: string
  title: string
  artistId?: string
  authorName?: string | null
  genres?: string[]
  useCases?: string[]
  duration?: number | null
  status: 'PENDING' | 'HIDDEN' | 'PUBLISHED'
  createdAt: string
  updatedAt?: string
  description?: string | null
}

type SignedUploadUrlData = {
  uploadUrl: string
  fileKey: string
}

function paginate<T>(items: T[], page: number, pageSize: number) {
  const totalItems = items.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * pageSize
  const slice = items.slice(start, start + pageSize)
  const meta: MyProductsListMeta = {
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

function mapMyProduct(p: any) {
  return {
    id: p.id,
    title: p.title,
    thumbnailUrl: p.cover || null,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    artistId: 'me',
    authorName: p.authorName || null,
    genres: Array.isArray(p.genres) ? p.genres : [],
    useCases: Array.isArray(p.useCases) ? p.useCases : [],
    duration: typeof p.duration === 'number' ? p.duration : null
  }
}

let mockMyProducts = (mockProducts as any[]).map(mapMyProduct)

function mapApiProduct(p: ApiProduct) {
  return {
    id: p.id,
    title: p.title,
    thumbnailUrl: null,
    status: p.status,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt ?? p.createdAt,
    artistId: p.artistId ?? '',
    authorName: p.authorName ?? null,
    genres: Array.isArray(p.genres) ? p.genres : [],
    useCases: Array.isArray(p.useCases) ? p.useCases : [],
    duration: typeof p.duration === 'number' ? p.duration : null
  }
}

export async function listMyProducts(input: { page?: number; pageSize?: number; q?: string; status?: string }) {
  const baseUrl = getApiBaseUrl()
  const shouldMock = mockFlags.meProducts || !baseUrl

  if (shouldMock) {
    const page = input.page || 1
    const pageSize = input.pageSize || 20
    const q = (input.q || '').trim().toLowerCase()
    const items = (mockMyProducts as any[]).filter(p => !q || String(p.title || '').toLowerCase().includes(q))
    const { slice, meta } = paginate(items, page, pageSize)
    const data: MyProductsListResponse = { items: slice }
    return { data, meta }
  }

  const res = await apiRequest<MyProductsListResponse, MyProductsListMeta>({
    path: '/me/products',
    method: 'GET',
    query: input
  })
  const data: MyProductsListResponse = { items: (res.data.items as any[]).map(mapApiProduct) }
  return { data, meta: res.meta }
}

export async function getMyProductDetail(productId: string) {
  const baseUrl = getApiBaseUrl()
  const shouldMock = mockFlags.meProducts || !baseUrl

  if (shouldMock) {
    const found = (mockMyProducts as any[]).find(p => p.id === productId)
    if (!found) throw new Error('NOT_FOUND')
    const data: MyProductDetail = { ...found, description: (found as any).description }
    return { data }
  }

  const res = await apiRequest<ApiProduct>({ path: `/me/products/${productId}`, method: 'GET' })
  const data: MyProductDetail = { ...mapApiProduct(res.data), description: res.data.description ?? undefined }
  return { data }
}

export async function createMyProduct(input: {
  title: string
  authorName?: string
  genre?: string
  genres?: string[]
  useCase?: string
  useCases?: string[]
  description?: string
  duration?: number
}) {
  const baseUrl = getApiBaseUrl()
  const shouldMock = mockFlags.meProducts || !baseUrl

  if (shouldMock) {
    const now = new Date().toISOString()
    const created: MyProductDetail = {
      id: `mock_${Math.random().toString(36).slice(2)}`,
      title: input.title,
      thumbnailUrl: null,
      status: 'PENDING',
      createdAt: now,
      updatedAt: now,
      artistId: 'me',
      authorName: input.authorName ?? null,
      genres: input.genres ?? (input.genre ? [input.genre] : []),
      useCases: input.useCases ?? (input.useCase ? [input.useCase] : []),
      duration: typeof input.duration === 'number' ? input.duration : null,
      description: input.description
    }
    mockMyProducts = [created, ...mockMyProducts]
    return { data: created }
  }

  const res = await apiRequest<ApiProduct>({
    path: '/me/products',
    method: 'POST',
    body: input
  })
  const data: MyProductDetail = { ...mapApiProduct(res.data), description: res.data.description ?? undefined }
  return { data }
}

export async function getMyProductOriginalUploadUrl(productId: string) {
  const baseUrl = getApiBaseUrl()
  const shouldMock = mockFlags.meProducts || !baseUrl

  if (shouldMock) {
    return {
      data: {
        uploadUrl: 'mock://upload/audio',
        fileKey: `audio/product/${productId}/original.mp3`
      } satisfies SignedUploadUrlData
    }
  }

  return apiRequest<SignedUploadUrlData>({
    path: `/me/products/${productId}/original-upload-url`,
    method: 'POST'
  })
}

export async function getMyProductThumbnailUploadUrl(productId: string, input: { extension: 'png' | 'jpg' | 'jpeg' | 'webp' }) {
  const baseUrl = getApiBaseUrl()
  const shouldMock = mockFlags.meProducts || !baseUrl

  if (shouldMock) {
    return {
      data: {
        uploadUrl: 'mock://upload/thumbnail',
        fileKey: `image/product/${productId}/thumbnail.${input.extension}`
      } satisfies SignedUploadUrlData
    }
  }

  return apiRequest<SignedUploadUrlData>({
    path: `/me/products/${productId}/thumbnail-upload-url`,
    method: 'POST',
    body: input
  })
}

export async function getMyProductSheetMusicUploadUrl(productId: string) {
  const baseUrl = getApiBaseUrl()
  const shouldMock = mockFlags.meProducts || !baseUrl

  if (shouldMock) {
    return {
      data: {
        uploadUrl: 'mock://upload/sheet-music',
        fileKey: `document/product/${productId}/sheet.pdf`
      } satisfies SignedUploadUrlData
    }
  }

  return apiRequest<SignedUploadUrlData>({
    path: `/me/products/${productId}/sheet-music-upload-url`,
    method: 'POST'
  })
}

export async function confirmMyProductAudioUpload(productId: string, input: { mode: 'original'; fileKey: string }) {
  const baseUrl = getApiBaseUrl()
  const shouldMock = mockFlags.meProducts || !baseUrl

  if (shouldMock) {
    const index = mockMyProducts.findIndex((item) => item.id === productId)
    if (index >= 0) {
      mockMyProducts[index] = { ...mockMyProducts[index], updatedAt: new Date().toISOString() }
    }
    return { data: mockMyProducts[index] ?? null }
  }

  return apiRequest<ApiProduct>({
    path: `/me/products/${productId}/confirm-audio-upload`,
    method: 'POST',
    body: input
  })
}

export async function confirmMyProductThumbnailUpload(productId: string, input: { fileKey: string }) {
  const baseUrl = getApiBaseUrl()
  const shouldMock = mockFlags.meProducts || !baseUrl

  if (shouldMock) {
    const index = mockMyProducts.findIndex((item) => item.id === productId)
    if (index >= 0) {
      mockMyProducts[index] = { ...mockMyProducts[index], updatedAt: new Date().toISOString() }
    }
    return { data: mockMyProducts[index] ?? null }
  }

  return apiRequest<ApiProduct>({
    path: `/me/products/${productId}/confirm-thumbnail-upload`,
    method: 'POST',
    body: input
  })
}

export async function confirmMyProductSheetMusicUpload(productId: string, input: { fileKey: string }) {
  const baseUrl = getApiBaseUrl()
  const shouldMock = mockFlags.meProducts || !baseUrl

  if (shouldMock) {
    const index = mockMyProducts.findIndex((item) => item.id === productId)
    if (index >= 0) {
      mockMyProducts[index] = { ...mockMyProducts[index], updatedAt: new Date().toISOString() }
    }
    return { data: mockMyProducts[index] ?? null }
  }

  return apiRequest<ApiProduct>({
    path: `/me/products/${productId}/confirm-sheet-music-upload`,
    method: 'POST',
    body: input
  })
}

