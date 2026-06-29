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
import { DEMO_PRODUCT_ID, useTourDemoStore } from '../../stores/tourDemo.store'

// Demo data: 2 platform với đầy đủ variants để tour minh họa
const DEMO_PLATFORMS: ProductPlatform[] = [
  {
    id: 'demo_platform_youtube',
    productId: DEMO_PRODUCT_ID,
    platformType: 'youtube',
    platformName: 'YouTube',
    isActive: true,
    deletedAt: null,
    isDeprecated: false,
    warnings: [],
    variantsCount: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo_platform_tiktok',
    productId: DEMO_PRODUCT_ID,
    platformType: 'tiktok',
    platformName: 'TikTok',
    isActive: true,
    deletedAt: null,
    isDeprecated: false,
    warnings: [],
    variantsCount: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const DEMO_PRICE_TABLE_YOUTUBE = {
  productPlatformId: 'demo_platform_youtube',
  platformType: 'youtube' as PricingPlatformType,
  platformName: 'YouTube',
  basePrice: 500000,
  isDeprecated: false,
  warnings: [],
  items: [
    {
      key: 'youtube_personal',
      attributeValues: { usage: 'personal' },
      attributeLabels: ['Sử dụng cá nhân'],
      referencePrice: 500000,
      sellingPrice: 350000,
      currency: 'VND',
      isConfigured: true,
      isActive: true,
      isLegacy: false,
      variantId: 'var_yt_1',
      updatedAt: new Date().toISOString(),
    },
    {
      key: 'youtube_commercial',
      attributeValues: { usage: 'commercial' },
      attributeLabels: ['Quảng cáo thương mại'],
      referencePrice: 1500000,
      sellingPrice: 1200000,
      currency: 'VND',
      isConfigured: true,
      isActive: true,
      isLegacy: false,
      variantId: 'var_yt_2',
      updatedAt: new Date().toISOString(),
    },
    {
      key: 'youtube_enterprise',
      attributeValues: { usage: 'enterprise' },
      attributeLabels: ['Doanh nghiệp / Thương hiệu lớn'],
      referencePrice: 3000000,
      sellingPrice: null,
      currency: 'VND',
      isConfigured: false,
      isActive: false,
      isLegacy: false,
      variantId: null,
      updatedAt: null,
    },
  ] satisfies PricingTableRow[],
  formulaOverview: {
    platformType: 'youtube' as PricingPlatformType,
    platformName: 'YouTube',
    baseSalary: 500000,
    platformRate: 0.7,
    basePrice: 500000,
    currency: 'VND',
    expressionLabel: 'Giá bán = Giá gốc × Hệ số sử dụng',
    attributes: [
      {
        key: 'usage',
        label: 'Mục đích sử dụng',
        kind: 'choice' as const,
        defaultValue: 'personal',
        defaultLabel: 'Cá nhân',
        options: [
          { value: 'personal', label: 'Cá nhân', coefficient: 0.7 },
          { value: 'commercial', label: 'Thương mại', coefficient: 2.4 },
          { value: 'enterprise', label: 'Doanh nghiệp', coefficient: 6 },
        ],
      },
    ],
  } satisfies PricingFormulaOverview,
}

const DEMO_PRICE_TABLE_TIKTOK = {
  productPlatformId: 'demo_platform_tiktok',
  platformType: 'tiktok' as PricingPlatformType,
  platformName: 'TikTok',
  basePrice: 300000,
  isDeprecated: false,
  warnings: [],
  items: [
    {
      key: 'tiktok_standard',
      attributeValues: { tier: 'standard' },
      attributeLabels: ['Tiêu chuẩn'],
      referencePrice: 300000,
      sellingPrice: 199000,
      currency: 'VND',
      isConfigured: true,
      isActive: true,
      isLegacy: false,
      variantId: 'var_tt_1',
      updatedAt: new Date().toISOString(),
    },
    {
      key: 'tiktok_viral',
      attributeValues: { tier: 'viral' },
      attributeLabels: ['Viral / Trending'],
      referencePrice: 800000,
      sellingPrice: 590000,
      currency: 'VND',
      isConfigured: true,
      isActive: true,
      isLegacy: false,
      variantId: 'var_tt_2',
      updatedAt: new Date().toISOString(),
    },
  ] satisfies PricingTableRow[],
  formulaOverview: null,
}

function isDemoProduct(productId: string) {
  return productId === DEMO_PRODUCT_ID
}

function isDemoMode() {
  return useTourDemoStore().isDemo
}

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
  if (isDemoProduct(productId) || isDemoMode()) {
    if (isDemoProduct(productId)) {
      return { data: { productId, items: DEMO_PLATFORMS } satisfies ProductPlatformsData }
    }
  }

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
  // Demo: trả về bảng giá mẫu cho từng platform
  if (productPlatformId === 'demo_platform_youtube') {
    return { data: DEMO_PRICE_TABLE_YOUTUBE satisfies ProductPlatformPriceTableData }
  }
  if (productPlatformId === 'demo_platform_tiktok') {
    return { data: DEMO_PRICE_TABLE_TIKTOK satisfies ProductPlatformPriceTableData }
  }

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

