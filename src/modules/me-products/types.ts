import type { PaginationMeta } from '../../shared/api/contracts'

export type MyProductListItem = {
  id: string
  productCode: string
  title: string
  thumbnailUrl: string | null
  status: string
  createdAt: string
}

export type MyProductsListResponse = { items: MyProductListItem[] }
export type MyProductsListMeta = PaginationMeta

export type MyProductDetail = MyProductListItem & {
  description?: string
}

