import { products as mockProducts } from '../../data/catalog'
import { apiRequest, getApiBaseUrl } from '../../shared/api/http'
import { mockFlags } from '../../shared/api/mockFlags'
import type { MyProductDetail, MyProductsListMeta, MyProductsListResponse } from './types'

type ApiProduct = {
  id: string
  title: string
  status: 'PENDING' | 'HIDDEN' | 'PUBLISHED'
  createdAt: string
  description?: string | null
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
    createdAt: new Date().toISOString()
  }
}

let mockMyProducts = (mockProducts as any[]).map(mapMyProduct)

function mapApiProduct(p: ApiProduct) {
  return {
    id: p.id,
    title: p.title,
    thumbnailUrl: null,
    status: p.status,
    createdAt: p.createdAt
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

