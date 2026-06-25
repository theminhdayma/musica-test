export type PricingPlatformType = 'youtube' | 'tiktok'
export type PricingPlatformResponseType = PricingPlatformType | string

export type PricingAttributeKind = 'choice' | 'numeric' | 'boolean' | 'numeric-bucketed'

export type PricingPlatformRequiredPermission = {
  id: string
  name: string
  lawReference: string
}

export type PricingPlatformListItem = {
  type: PricingPlatformType
  name: string
  requiredPermissions: PricingPlatformRequiredPermission[]
}

export type PricingAttributeOption = {
  value: string
  label: string
}

export type PricingAttributeSchema = {
  key: string
  label: string
  kind: PricingAttributeKind
  options?: PricingAttributeOption[]
  min?: number
  max?: number
}

export type PricingFormulaAttributeOption = {
  value: string
  label: string
  coefficient: number
}

export type PricingFormulaAttribute = {
  key: string
  label: string
  kind: PricingAttributeKind
  defaultValue: string
  defaultLabel: string
  options: PricingFormulaAttributeOption[]
}

export type PricingFormulaOverview = {
  platformType: PricingPlatformType
  platformName: string
  baseSalary: number
  platformRate: number
  basePrice: number
  currency: string
  expressionLabel: string
  attributes: PricingFormulaAttribute[]
}

export type ProductPlatform = {
  id: string
  productId: string
  platformType: PricingPlatformResponseType
  platformName: string
  isActive: boolean
  deletedAt: string | null
  isDeprecated: boolean
  warnings: string[]
  variantsCount: number
  createdAt: string
  updatedAt: string
}

export type ProductPricingSummary = {
  productId: string
  platformCount: number
  variantCount: number
  configured: boolean
}

export type PricingTableRow = {
  key: string
  attributeValues: Record<string, unknown>
  attributeLabels: string[]
  referencePrice: number | null
  sellingPrice: number | null
  currency: string
  isConfigured: boolean
  isActive: boolean
  isLegacy: boolean
  variantId: string | null
  updatedAt: string | null
}

export type SavePricingTableBody = {
  items: Array<{
    key: string
    sellingPrice: number | null
    isActive: boolean
  }>
}

