import { apiRequest, getApiBaseUrl } from '../../shared/api/http'
import { mockFlags } from '../../shared/api/mockFlags'
import type { ComplianceDetail } from './types'

export async function getMyComplianceDetail(trackId: string) {
  const baseUrl = getApiBaseUrl()
  const shouldMock = mockFlags.meProducts || !baseUrl

  if (shouldMock) {
    return {
      data: {
        complianceId: `mock_${trackId}`,
        legalStatus: 'PENDING',
        reviewStatus: 'PENDING',
        rejectReason: null,
        reviewedBy: null,
        reviewedByName: null,
        reviewedAt: null,
        approvedPermissionIds: [],
        approvedPermissions: [],
        uploadedLegalFiles: [],
        product: {
          trackId,
          title: 'Mock',
          artistId: 'me',
          artistName: null,
          status: 'PENDING',
        },
      } satisfies ComplianceDetail,
    }
  }

  return apiRequest<ComplianceDetail>({
    path: `/me/compliance/${trackId}`,
    method: 'GET',
  })
}

