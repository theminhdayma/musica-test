import type { PaginationMeta } from '../../shared/api/contracts'

export type ProductListItem = {
  id: string
  productCode: string
  title: string
  thumbnailUrl: string | null
  artistDisplayName: string
  genre: string | null
  genres: string[]
  durationSeconds: number | null
  useCases: string[]
  createdAt: string
  updatedAt: string
  basePrice?: number
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
  digitalRightConfigId?: string | null
  physicalRightConfigId?: string | null
}

export type SignedUrl = {
  url: string
  expiresInSeconds: number
}

