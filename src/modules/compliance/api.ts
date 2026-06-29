import { apiRequest, getApiBaseUrl } from '../../shared/api/http'
import { mockFlags } from '../../shared/api/mockFlags'
import type { ComplianceDetail } from './types'
import { DEMO_PRODUCT_ID } from '../../stores/tourDemo.store'

export async function getMyComplianceDetail(trackId: string) {
  // Demo: trả về compliance mẫu đã được duyệt để tour minh họa đầy đủ
  if (trackId === DEMO_PRODUCT_ID) {
    return {
      data: {
        complianceId: 'demo_compliance',
        legalStatus: 'SUFFICIENT',
        reviewStatus: 'APPROVED',
        rejectReason: null,
        reviewedBy: 'musica_admin',
        reviewedByName: 'Đội kiểm duyệt Musica',
        reviewedAt: new Date(Date.now() - 86400000).toISOString(),
        approvedPermissionIds: ['perm_stream', 'perm_download_personal', 'perm_commercial_ad'],
        approvedPermissions: [
          { name: 'Phát nhạc trực tuyến', lawReference: 'Luật SHTT Điều 20' },
          { name: 'Tải xuống dùng cá nhân', lawReference: 'Luật SHTT Điều 25' },
          { name: 'Sử dụng trong quảng cáo thương mại', lawReference: 'Luật SHTT Điều 20.2' },
        ],
        uploadedLegalFiles: [
          {
            fileName: 'hop-dong-tac-gia.pdf',
            fileKey: 'demo/legal/contract.pdf',
            uploadedAt: new Date(Date.now() - 172800000).toISOString(),
            mimeType: 'application/pdf',
            size: 245760,
          },
        ],
        product: {
          trackId,
          title: 'Cánh Đồng Ký Ức (Demo)',
          artistId: 'demo_artist',
          artistName: 'Nghệ sĩ Demo',
          status: 'PENDING',
        },
      } satisfies ComplianceDetail,
    }
  }

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

