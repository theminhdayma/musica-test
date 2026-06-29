export type BuyerCartItem = {
  id: string
  productId: string
  title: string
  artist: string
  thumbnailUrl: string | null
  price: number
  currency: string
  qty: number
  configuration: Record<string, string>
  selectedUsageRights: string[]
  pricingAttributes: Record<string, string>
  platformName: string
  createdAt: string
  updatedAt: string
}

export type BuyerCartResponse = {
  items: BuyerCartItem[]
}

export type UpsertBuyerCartItemInput = {
  productId: string
  selectedUsageRights: string[]
  pricingAttributes: Record<string, unknown>
}

export type RemoveBuyerCartItemsResponse = {
  removedIds: string[]
}
