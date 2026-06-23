import { apiRequest, getApiBaseUrl } from '../../shared/api/http'
import { mockFlags } from '../../shared/api/mockFlags'
import type {
  PricingAttributeSchema,
  PricingFormulaOverview,
  PricingPlatformListItem,
  PricingPlatformType,
  PricingTableRow,
  ProductPlatform,
  SavePricingTableBody,
} from './types'

type ProductPlatformsData = {
  productId: string
  items: ProductPlatform[]
}

type ProductPlatformPriceTableData = {
  productPlatformId: string
  platformType: string
  platformName: string
  basePrice: number
  isDeprecated: boolean
  warnings: string[]
  items: PricingTableRow[]
  formulaOverview: PricingFormulaOverview | null
}

export async function listPricingPlatforms() {
  const baseUrl = getApiBaseUrl()
  const shouldMock = mockFlags.meProducts || !baseUrl

  if (shouldMock) {
    return { data: [] as PricingPlatformListItem[] }
  }

  return apiRequest<PricingPlatformListItem[]>({
    path: '/platforms',
    method: 'GET',
  })
}

export async function getPricingPlatformSchema(platformType: PricingPlatformType) {
  const baseUrl = getApiBaseUrl()
  const shouldMock = mockFlags.meProducts || !baseUrl

  if (shouldMock) {
    return { data: [] as PricingAttributeSchema[] }
  }

  return apiRequest<PricingAttributeSchema[]>({
    path: `/platforms/${platformType}/schema`,
    method: 'GET',
  })
}

export async function listMyProductPlatforms(productId: string) {
  const baseUrl = getApiBaseUrl()
  const shouldMock = mockFlags.meProducts || !baseUrl

  if (shouldMock) {
    return { data: { productId, items: [] } satisfies ProductPlatformsData }
  }

  return apiRequest<ProductPlatformsData>({
    path: `/me/products/${productId}/platforms`,
    method: 'GET',
  })
}

export async function createMyProductPlatform(productId: string, body: { platformType: PricingPlatformType }) {
  const baseUrl = getApiBaseUrl()
  const shouldMock = mockFlags.meProducts || !baseUrl

  if (shouldMock) {
    const now = new Date().toISOString()
    return {
      data: {
        id: `mock_${Math.random().toString(36).slice(2)}`,
        productId,
        platformType: body.platformType,
        platformName: body.platformType,
        isActive: true,
        deletedAt: null,
        isDeprecated: false,
        warnings: [],
        variantsCount: 0,
        createdAt: now,
        updatedAt: now,
      } satisfies ProductPlatform,
    }
  }

  return apiRequest<ProductPlatform>({
    path: `/me/products/${productId}/platforms`,
    method: 'POST',
    body,
  })
}

export async function deleteMyProductPlatform(productId: string, platformType: PricingPlatformType) {
  const baseUrl = getApiBaseUrl()
  const shouldMock = mockFlags.meProducts || !baseUrl

  if (shouldMock) {
    const now = new Date().toISOString()
    return {
      data: {
        id: `mock_${Math.random().toString(36).slice(2)}`,
        productId,
        platformType,
        platformName: platformType,
        isActive: false,
        deletedAt: now,
        isDeprecated: false,
        warnings: [],
        variantsCount: 0,
        createdAt: now,
        updatedAt: now,
      } satisfies ProductPlatform,
    }
  }

  return apiRequest<ProductPlatform>({
    path: `/me/products/${productId}/platforms/${platformType}`,
    method: 'DELETE',
  })
}

export async function getMyProductPlatformPriceTable(productPlatformId: string) {
  const baseUrl = getApiBaseUrl()
  const shouldMock = mockFlags.meProducts || !baseUrl

  if (shouldMock) {
    return {
      data: {
        productPlatformId,
        platformType: 'mock',
        platformName: 'Mock',
        basePrice: 0,
        isDeprecated: false,
        warnings: [],
        items: [],
        formulaOverview: null,
      } satisfies ProductPlatformPriceTableData,
    }
  }

  return apiRequest<ProductPlatformPriceTableData>({
    path: `/me/product-platforms/${productPlatformId}/price-table`,
    method: 'GET',
  })
}

export async function saveMyProductPlatformPriceTable(productPlatformId: string, body: SavePricingTableBody) {
  const baseUrl = getApiBaseUrl()
  const shouldMock = mockFlags.meProducts || !baseUrl

  if (shouldMock) {
    return getMyProductPlatformPriceTable(productPlatformId)
  }

  return apiRequest<ProductPlatformPriceTableData>({
    path: `/me/product-platforms/${productPlatformId}/price-table`,
    method: 'PATCH',
    body,
  })
}

