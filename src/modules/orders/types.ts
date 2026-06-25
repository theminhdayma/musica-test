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

export type OrderDetailResponse = {
  id: string
  orderNumber: string
  status: 'PENDING_PAYMENT' | 'PAID' | 'CANCELLED'
  currency: string
  amounts: {
    subtotalAmount: number
    discountAmount: number
    taxAmount: number
    totalAmount: number
  }
  buyer: {
    id: string
    email: string
    fullName: string
  }
  items: Array<{
    productId: string
    title: string
    unitPrice: number
    quantity: number
    lineTotalAmount: number
    selectedUsageRightsSnapshot?: string[]
    pricingAttributesSnapshot?: Record<string, unknown> | null
  }>
  payment: {
    provider: string
    transactionId: string | null
    status: 'SUCCEEDED' | 'FAILED' | 'PENDING' | 'VOIDED'
    amount: number
    paidAt: string | null
  } | null
  paidAt: string | null
  createdAt: string
  buyerSnapshotName?: string | null
}

export type SepayCheckoutResponse = {
  actionUrl: string
  method: 'POST'
  fields: Record<string, string>
}
