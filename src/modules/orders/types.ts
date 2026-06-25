export type CreateOrderItemInput = {
  productId: string
  quantity: number
  selectedUsageRights: string[]
  pricingAttributes: Record<string, unknown>
}

export type CreateOrderInput = {
  idempotencyKey?: string
  buyer: {
    fullName: string
  }
  items: CreateOrderItemInput[]
  payment?: {
    provider: string
    method: string
  }
  clientContext?: Record<string, unknown>
}

export type CreatedOrderItem = {
  orderItemId: string
  productId: string
  productTitleSnapshot: string
  quantity: number
  unitPrice: number
  lineTotalAmount: number
  selectedUsageRightsSnapshot: string[]
  pricingAttributesSnapshot: Record<string, unknown>
}

export type CreatedOrderResponse = {
  orderId: string
  orderNumber: string
  orderStatus: 'PENDING_PAYMENT' | 'PAID' | 'CANCELLED'
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED'
  fulfillmentStatus: 'UNFULFILLED' | 'PROCESSING' | 'FULFILLED' | 'CANCELLED'
  currency: string
  amounts: {
    subtotalAmount: number
    discountAmount: number
    taxAmount: number
    totalAmount: number
  }
  items: CreatedOrderItem[]
  buyerSnapshot: {
    fullName: string
  }
  createdAt: string
}
