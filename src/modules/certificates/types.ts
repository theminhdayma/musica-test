import type { PaginationMeta } from '../../shared/api/contracts'

export type CertificateListItem = {
  id: string
  orderId?: string
  orderNumber?: string
  productId: string
  productCode: string
  productTitle: string
  artistDisplayName: string
  status: string
  validFrom: string
  validUntil: string | null
  createdAt: string
  paymentMethodLabel?: string | null
  buyerName?: string | null
  assetType?: string | null
}

export type CertificatesListResponse = { items: CertificateListItem[] }
export type CertificatesListMeta = PaginationMeta

export type CertificateDetail = CertificateListItem & {
  rightsSummary?: string[]
  pricingAttributesSummary?: Array<{ key: string; label: string }>
  contractVersion?: string | null
  licenseType?: string | null
  issuedAt?: string | null
  purchasedAssets?: Array<{
    productId: string
    productTitle: string
    unitPrice: number
    quantity: number
    lineTotalAmount: number
    selectedUsageRights: string[]
    pricingAttributes: Array<{ key: string; label: string }>
  }>
}

export type SignedDownload = {
  downloadUrl: string
  expiresInSeconds: number
}

