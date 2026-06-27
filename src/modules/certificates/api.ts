import { products as mockProducts } from '../../data/catalog'
import { apiRequest, getApiBaseUrl } from '../../shared/api/http'
import { mockFlags } from '../../shared/api/mockFlags'
import type { CertificatesListMeta, CertificatesListResponse, CertificateDetail, SignedDownload } from './types'

const RECENT_PURCHASE_CERTIFICATES_KEY = 'recent_purchase_certificates'

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

function formatPaymentMethodLabel(value: string | null | undefined) {
  const normalized = String(value || '').trim().toLowerCase()
  if (!normalized) return 'SePay'
  if (normalized === 'bank_transfer') return 'Chuyển khoản ngân hàng'
  if (normalized === 'sepay') return 'SePay'
  return normalized.toUpperCase()
}

function humanizePricingValue(value: unknown) {
  if (value === null || typeof value === 'undefined' || value === '') return 'Chưa chọn'
  if (typeof value === 'boolean') return value ? 'Có' : 'Không'
  return String(value)
}

function readRecentPurchaseCertificates(): CertificateDetail[] {
  try {
    const raw = globalThis.sessionStorage?.getItem(RECENT_PURCHASE_CERTIFICATES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function mockCertificates() {
  const now = new Date()
  const recent = readRecentPurchaseCertificates()
  if (recent.length) {
    return recent
  }

  return (mockProducts as any[]).slice(0, 6).map((p, idx) => {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
    const createdAt = new Date(now.getTime() - idx * 86400000).toISOString()
    return {
      id,
      orderId: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `order-${idx + 1}`,
      orderNumber: `ORD-DEMO-${String(idx + 1).padStart(4, '0')}`,
      productId: p.id,
      productCode: p.isrc ? String(p.isrc) : `PROD-${String(p.id).slice(0, 6).padStart(6, '0')}`,
      productTitle: p.title,
      artistDisplayName: p.artist,
      status: 'ACTIVE',
      validFrom: createdAt,
      validUntil: null,
      createdAt,
      paymentMethodLabel: 'SePay',
      buyerName: 'Buyer Demo',
      assetType: 'Bản quyền số',
      rightsSummary: ['Quyền sử dụng số cơ bản'],
      pricingAttributesSummary: [],
      contractVersion: '1.0',
      licenseType: 'Giấy phép tác quyền số',
      issuedAt: createdAt,
      purchasedAssets: [
        {
          productId: p.id,
          productTitle: p.title,
          unitPrice: Number(p.price || 0),
          quantity: 1,
          lineTotalAmount: Number(p.price || 0),
          selectedUsageRights: ['Quyền sử dụng số cơ bản'],
          pricingAttributes: []
        }
      ]
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

