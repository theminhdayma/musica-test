import { products as mockProducts } from '../../data/catalog'
import { apiRequest, getApiBaseUrl } from '../../shared/api/http'
import { mockFlags } from '../../shared/api/mockFlags'
import type { MyProductDetail, MyProductsListMeta, MyProductsListResponse } from './types'

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
    productCode: p.isrc ? String(p.isrc) : `PROD-${String(p.id).slice(0, 6).padStart(6, '0')}`,
    title: p.title,
    thumbnailUrl: p.cover || null,
    status: 'PUBLISHED',
    createdAt: new Date().toISOString()
  }
}

export async function listMyProducts(input: { page?: number; pageSize?: number; q?: string; status?: string }) {
  const baseUrl = getApiBaseUrl()
  const shouldMock = mockFlags.meProducts || !baseUrl

  if (shouldMock) {
    const page = input.page || 1
    const pageSize = input.pageSize || 20
    const q = (input.q || '').trim().toLowerCase()
    const items = (mockProducts as any[]).filter(p => !q || String(p.title || '').toLowerCase().includes(q)).map(mapMyProduct)
    const { slice, meta } = paginate(items, page, pageSize)
    const data: MyProductsListResponse = { items: slice }
    return { data, meta }
  }

  const res = await apiRequest<MyProductsListResponse, MyProductsListMeta>({
    path: '/me/products',
    method: 'GET',
    query: input
  })
  return { data: res.data, meta: res.meta }
}

export async function getMyProductDetail(productId: string) {
  const baseUrl = getApiBaseUrl()
  const shouldMock = mockFlags.meProducts || !baseUrl

  if (shouldMock) {
    const found = (mockProducts as any[]).find(p => p.id === productId)
    if (!found) throw new Error('NOT_FOUND')
    const data: MyProductDetail = { ...mapMyProduct(found), description: found.description }
    return { data }
  }

  const res = await apiRequest<MyProductDetail>({ path: `/me/products/${productId}`, method: 'GET' })
  return { data: res.data }
}

