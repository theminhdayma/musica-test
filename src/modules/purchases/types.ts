export type PurchaseRequest = {
  productId: string
  selection: unknown
  payment: {
    provider: string
    method: string
  }
}

export type PurchaseResponse = {
  purchaseId: string
  certificateId: string
  status: 'SUCCEEDED' | 'FAILED' | 'PENDING'
}

