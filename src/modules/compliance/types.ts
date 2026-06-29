export type ComplianceLegalStatus = 'PENDING' | 'SUFFICIENT' | 'INSUFFICIENT'
export type ComplianceReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type ProductStatus = 'PENDING' | 'HIDDEN' | 'PUBLISHED'

export type ComplianceDetail = {
  complianceId: string
  legalStatus: ComplianceLegalStatus
  reviewStatus: ComplianceReviewStatus
  rejectReason: string | null
  reviewedBy: string | null
  reviewedByName: string | null
  reviewedAt: string | null
  approvedPermissionIds: string[]
  approvedPermissions: Array<{
    name: string
    lawReference: string
  }>
  uploadedLegalFiles: Array<{
    fileName: string
    fileKey: string
    uploadedAt: string
    mimeType: string
    size: number
  }>
  product: {
    trackId: string
    title: string
    artistId: string
    artistName: string | null
    status: ProductStatus
  }
}

