import { products as mockProducts } from "../../data/catalog";
import type {
  ProductsListMeta,
  ProductsListResponse,
  ProductDetail,
  SignedUrl,
} from "./types";
import { apiRequest, getApiBaseUrl } from "../../shared/api/http";
import { mockFlags } from "../../shared/api/mockFlags";
import { toInternalProductId, toPublicProductId } from "./idMap";

function mapToDetail(p: any): ProductDetail {
  return {
    id: toPublicProductId(String(p.id)),
    productCode: p.isrc
      ? String(p.isrc)
      : `PROD-${String(p.id).slice(0, 6).padStart(6, "0")}`,
    title: p.title,
    description: p.description,
    genre: p.category,
    durationSeconds:
      typeof p.duration === "number" ? Math.round(p.duration * 60) : undefined,
    thumbnailUrl: p.cover || null,
    artist: { id: p.artistId || p.artist, displayName: p.artist },
    documents: Array.isArray(p.documents) ? p.documents : undefined,
  };
}

export async function listProducts(input: {
  page?: number;
  pageSize?: number;
  q?: string;
  genre?: string;
  highlight?: "new" | "trending";
  artistId?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?:
    | "createdAt:desc"
    | "createdAt:asc"
    | "updatedAt:desc"
    | "updatedAt:asc"
    | "title:asc"
    | "title:desc"
    | "genre:asc"
    | "genre:desc";
}) {
  const res = await apiRequest<ProductsListResponse, ProductsListMeta>({
    path: "/products",
    method: "GET",
    query: input,
  });
  return { data: res.data, meta: res.meta };
}

export async function listRelatedProductsByAuthor(input: {
  productId: string;
  limit?: number;
}) {
  const baseUrl = getApiBaseUrl();
  const shouldMock = mockFlags.products || !baseUrl;

  if (shouldMock) {
    const internalId = toInternalProductId(input.productId);
    const current = (mockProducts as any[]).find((p) => p.id === internalId);
    if (!current) return { data: { items: [] } as ProductsListResponse };

    const pool = (mockProducts as any[])
      .filter((p) => p.artist === current.artist && p.id !== internalId)
      .slice();

    for (let i = pool.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = pool[i];
      pool[i] = pool[j];
      pool[j] = tmp;
    }

    const picked = pool.slice(0, Math.max(0, input.limit ?? 4));
    return {
      data: {
        items: picked.map((p) => ({
          id: toPublicProductId(String(p.id)),
          productCode: p.isrc
            ? String(p.isrc)
            : `PROD-${String(p.id).slice(0, 6).padStart(6, "0")}`,
          title: p.title,
          thumbnailUrl: p.cover || null,
          artistDisplayName: p.artist,
          genre: p.category || null,
          genres: [p.category].filter(Boolean),
          durationSeconds:
            typeof p.duration === "number" ? Math.round(p.duration * 60) : null,
          useCases: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
      } as ProductsListResponse,
    };
  }

  const res = await apiRequest<ProductsListResponse>({
    path: `/products/${input.productId}/related-by-author`,
    method: "GET",
    query: {
      limit: input.limit ?? 4,
    },
  });
  return { data: res.data };
}

export async function getProduct(productId: string) {
  const baseUrl = getApiBaseUrl();
  const shouldMock = mockFlags.products || !baseUrl;

  if (shouldMock) {
    const internalId = toInternalProductId(productId);
    const found = (mockProducts as any[]).find((p) => p.id === internalId);
    if (!found) throw new Error("NOT_FOUND");
    return { data: mapToDetail(found) };
  }

  const res = await apiRequest<ProductDetail>({
    path: `/marketplace/products/${productId}`,
    method: "GET",
  });
  return { data: res.data };
}

export async function getProductDescriptionPdfUrl(productId: string) {
  const baseUrl = getApiBaseUrl();
  const shouldMock = mockFlags.products || !baseUrl;

  if (shouldMock) {
    const internalId = toInternalProductId(productId);
    const found = (mockProducts as any[]).find((p) => p.id === internalId);
    const pdfDoc = Array.isArray(found?.documents)
      ? found.documents.find(
          (d: any) =>
            String(d?.mimeType || "").includes("pdf") ||
            String(d?.name || "")
              .toLowerCase()
              .endsWith(".pdf"),
        )
      : null;
    return {
      data: { descriptionPdfUrl: pdfDoc?.url || "" } as {
        descriptionPdfUrl: string;
      },
    };
  }

  const res = await apiRequest<{ descriptionPdfUrl: string }>({
    path: `/marketplace/products/${productId}/description-pdf-url`,
    method: "GET",
  });
  return { data: res.data };
}

export async function getProductThumbnailUrl(productId: string) {
  const baseUrl = getApiBaseUrl();
  const shouldMock = mockFlags.products || !baseUrl;

  if (shouldMock) {
    const internalId = toInternalProductId(productId);
    const found = (mockProducts as any[]).find((p) => p.id === internalId);
    const url = found?.cover;
    if (!url)
      return { data: { url: "", expiresInSeconds: 0 } satisfies SignedUrl };
    return { data: { url, expiresInSeconds: 3600 } };
  }

  const res = await apiRequest<SignedUrl>({
    path: `/products/${productId}/thumbnail-url`,
    method: "GET",
  });
  return { data: res.data };
}

export async function getProductPlaybackUrl(productId: string) {
  const baseUrl = getApiBaseUrl();
  const shouldMock = mockFlags.products || !baseUrl;

  if (shouldMock) {
    return { data: { url: "", expiresInSeconds: 0 } satisfies SignedUrl };
  }

  const res = await apiRequest<SignedUrl>({
    path: `/products/${productId}/playback-url`,
    method: "GET",
  });
  return { data: res.data };
}

export async function getExpressionConfigs() {
  const res = await apiRequest<any>({
    path: `/public/configs/expressions`,
    method: "GET",
  });
  return res.data;
}

export async function getModificationConfigs() {
  const res = await apiRequest<any>({
    path: `/public/configs/modifications`,
    method: "GET",
  });
  return res.data;
}

export async function calculateVariantPricing(payload: any) {
  const res = await apiRequest<any>({
    path: `/public/variant-pricing/calculate`,
    method: "POST",
    body: payload,
  });
  return res.data;
}
