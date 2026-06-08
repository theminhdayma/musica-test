import { apiRequest, getApiBaseUrl } from '../../shared/api/http'
import { mockFlags } from '../../shared/api/mockFlags'
import type { PurchaseRequest, PurchaseResponse } from './types'

export async function purchase(input: PurchaseRequest) {
  const baseUrl = getApiBaseUrl()
  const shouldMock = mockFlags.purchase || !baseUrl

  if (shouldMock) {
    const purchaseId = Math.random().toString(36).slice(2) + Date.now().toString(36)
    const certificateId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
    const data: PurchaseResponse = { purchaseId, certificateId, status: 'SUCCEEDED' }
    return { data }
  }

  const res = await apiRequest<PurchaseResponse>({
    path: '/purchases',
    method: 'POST',
    body: input
  })
  return { data: res.data }
}

