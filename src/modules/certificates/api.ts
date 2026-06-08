import { products as mockProducts } from '../../data/catalog'
import { apiRequest, getApiBaseUrl } from '../../shared/api/http'
import { mockFlags } from '../../shared/api/mockFlags'
import type { CertificatesListMeta, CertificatesListResponse, CertificateDetail, SignedDownload } from './types'

function paginate<T>(items: T[], page: number, pageSize: number) {
  const totalItems = items.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * pageSize
  const slice = items.slice(start, start + pageSize)
  const meta: CertificatesListMeta = {
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

function mockCertificates() {
  const now = new Date()
  return (mockProducts as any[]).slice(0, 6).map((p, idx) => {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
    const createdAt = new Date(now.getTime() - idx * 86400000).toISOString()
    return {
      id,
      productId: p.id,
      productCode: p.isrc ? String(p.isrc) : `PROD-${String(p.id).slice(0, 6).padStart(6, '0')}`,
      productTitle: p.title,
      artistDisplayName: p.artist,
      status: 'ACTIVE',
      validFrom: createdAt,
      validUntil: null,
      createdAt
    } satisfies CertificateDetail
  })
}

export async function listMyCertificates(input: { page?: number; pageSize?: number; q?: string }) {
  const baseUrl = getApiBaseUrl()
  const shouldMock = mockFlags.certificates || !baseUrl

  if (shouldMock) {
    const page = input.page || 1
    const pageSize = input.pageSize || 20
    const q = (input.q || '').trim().toLowerCase()
    const all = mockCertificates()
    const filtered = all.filter(it => !q || it.productTitle.toLowerCase().includes(q) || it.productCode.toLowerCase().includes(q))
    const { slice, meta } = paginate(filtered, page, pageSize)
    const data: CertificatesListResponse = { items: slice }
    return { data, meta }
  }

  const res = await apiRequest<CertificatesListResponse, CertificatesListMeta>({
    path: '/me/certificates',
    method: 'GET',
    query: input
  })
  return { data: res.data, meta: res.meta }
}

export async function getMyCertificateDetail(certificateId: string) {
  const baseUrl = getApiBaseUrl()
  const shouldMock = mockFlags.certificates || !baseUrl

  if (shouldMock) {
    const found = mockCertificates().find(it => it.id === certificateId)
    if (!found) throw new Error('NOT_FOUND')
    return { data: found }
  }

  const res = await apiRequest<CertificateDetail>({ path: `/me/certificates/${certificateId}`, method: 'GET' })
  return { data: res.data }
}

export async function getMyCertificateDownloadUrl(certificateId: string) {
  const baseUrl = getApiBaseUrl()
  const shouldMock = mockFlags.certificates || !baseUrl

  if (shouldMock) {
    const data: SignedDownload = { downloadUrl: '', expiresInSeconds: 0 }
    return { data }
  }

  const res = await apiRequest<SignedDownload>({ path: `/me/certificates/${certificateId}/download`, method: 'GET' })
  return { data: res.data }
}

