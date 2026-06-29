import type { PaginationMeta } from "../../shared/api/contracts";

export type ProductListItem = {
  id: string;
  productCode: string;
  title: string;
  thumbnailUrl: string | null;
  artistDisplayName: string;
  genre: string | null;
  genres: string[];
  durationSeconds: number | null;
  useCases: string[];
  createdAt: string;
  updatedAt: string;
  basePrice?: number;
  hasSheetMusic?: boolean;
  priorityScore?: number;
  isTrigger?: boolean;
  documents?: ProductDocument[];
};

export type ProductsListResponse = {
  items: ProductListItem[];
};

export type ProductsListMeta = PaginationMeta;

export type ProductDetail = {
  id: string;
  productCode: string;
  title: string;
  description?: string | null;
  thumbnailUrl: string | null;
  artist?: { id: string; displayName: string };
  artistId?: string;
  authorName?: string | null;
  genre?: string | null;
  genres?: string[];
  duration?: number | null;
  durationSeconds?: number | null;
  previewAudioUrl?: string | null;
  useCases?: string[];
  allowedPermissions?: ProductAllowedPermission[];
  createdAt?: string;
  updatedAt?: string;
  availableRightsSummary?: unknown;
  digitalRightConfigId?: string | null;
  physicalRightConfigId?: string | null;
  documents?: ProductDocument[];
};

export type ProductAllowedPermission = {
  id: string;
  name: string;
  lawReference: string;
};

export type ProductPricingSchemaOption = {
  value: string;
  label: string;
};

export type ProductPricingSchemaAttribute = {
  key: string;
  label: string;
  kind: "choice" | "numeric" | "boolean" | "numeric-bucketed";
  options?: ProductPricingSchemaOption[];
  min?: number;
  max?: number;
};

export type MarketplacePricingTableRow = {
  attributeValues: Record<string, unknown>;
  referencePrice: number | null;
  sellingPrice: number;
  currency: string;
  updatedAt: string | null;
};

export type MarketplaceProductPricingTable = {
  productId: string;
  platformType: string;
  platformName: string;
  schema: ProductPricingSchemaAttribute[];
  items: MarketplacePricingTableRow[];
  warnings: string[];
};

export type AdminProductPlatform = {
  id: string;
  productId: string;
  platformType: string;
  platformName: string;
  isActive: boolean;
  deletedAt: string | null;
  isDeprecated: boolean;
  warnings: string[];
  variantsCount: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminProductPlatformsResponse = {
  productId: string;
  items: AdminProductPlatform[];
};

export type PricingTableRow = {
  key: string;
  attributeValues: Record<string, unknown>;
  attributeLabels: string[];
  referencePrice: number | null;
  sellingPrice: number | null;
  currency: string;
  isConfigured: boolean;
  isActive: boolean;
  isLegacy: boolean;
  variantId: string | null;
  updatedAt: string | null;
};

export type ProductPlatformPriceTable = {
  productPlatformId: string;
  platformType: string;
  platformName: string;
  basePrice: number;
  isDeprecated: boolean;
  warnings: string[];
  items: PricingTableRow[];
};

export type SignedUrl = {
  url: string;
  expiresInSeconds: number;
};

export type ProductDocument = {
  name: string;
  url: string;
  mimeType?: string;
};
