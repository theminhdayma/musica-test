import type { PaginationMeta } from '../../shared/api/contracts'

export type MyProductListItem = {
  id: string
  title: string
  thumbnailUrl: string | null
  status: 'PENDING' | 'HIDDEN' | 'PUBLISHED'
  createdAt: string
  updatedAt: string
  artistId: string
  authorName: string | null
  genres: string[]
  useCases: string[]
  duration: number | null
}

export type MyProductsListResponse = { items: MyProductListItem[] }
export type MyProductsListMeta = PaginationMeta

export type MyProductDetail = MyProductListItem & {
  description?: string
}

