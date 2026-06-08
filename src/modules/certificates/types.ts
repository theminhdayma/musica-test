import type { PaginationMeta } from '../../shared/api/contracts'

export type CertificateListItem = {
  id: string
  productId: string
  productCode: string
  productTitle: string
  artistDisplayName: string
  status: string
  validFrom: string
  validUntil: string | null
  createdAt: string
}

export type CertificatesListResponse = { items: CertificateListItem[] }
export type CertificatesListMeta = PaginationMeta

export type CertificateDetail = CertificateListItem & {
  rightsSummary?: unknown
}

export type SignedDownload = {
  downloadUrl: string
  expiresInSeconds: number
}

