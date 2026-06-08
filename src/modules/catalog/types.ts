import type { PaginationMeta } from '../../shared/api/contracts'

export type ProductListItem = {
  id: string
  productCode: string
  title: string
  thumbnailUrl: string | null
  artistDisplayName: string
}

export type ProductsListResponse = {
  items: ProductListItem[]
}

export type ProductsListMeta = PaginationMeta

export type ProductDetail = {
  id: string
  productCode: string
  title: string
  description?: string
  genre?: string
  durationSeconds?: number
  thumbnailUrl: string | null
  artist: { id: string; displayName: string }
  availableRightsSummary?: unknown
}

export type SignedUrl = {
  url: string
  expiresInSeconds: number
}

