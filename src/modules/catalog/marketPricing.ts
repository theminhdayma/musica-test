import type { ProductListItem } from "./types";

const HOT_SCORE_THRESHOLD = 50;
const SALE_PERCENTAGES = [5, 7, 10] as const;
const PRICE_STEP = 10_000;

export function getStableSeed(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function roundMarketPrice(value: number) {
  return Math.round(value / PRICE_STEP) * PRICE_STEP;
}

export function isProductNew(createdAt: string | null | undefined) {
  const created = createdAt ? new Date(createdAt) : null;
  if (!created || Number.isNaN(created.getTime())) return false;
  const diffDays = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= 7;
}

export function isProductTrending(
  item: Pick<ProductListItem, "priorityScore" | "isTrigger">,
) {
  const score = typeof item.priorityScore === "number" ? item.priorityScore : 0;
  return item.isTrigger === true && score >= HOT_SCORE_THRESHOLD;
}

export function getProductMarketPricing(
  item: Pick<
    ProductListItem,
    "id" | "title" | "basePrice" | "createdAt" | "priorityScore" | "isTrigger"
  >,
) {
  const seed = getStableSeed(`${item.id}:${item.title}`);
  const currentPrice =
    typeof item.basePrice === "number" && item.basePrice > 0
      ? item.basePrice
      : roundMarketPrice(
          1_690_000 +
            (seed % 11) * 120_000 +
            (isProductTrending(item) ? 180_000 : 0) +
            (isProductNew(item.createdAt) ? 70_000 : 0),
        );

  const discountPercent = SALE_PERCENTAGES[seed % SALE_PERCENTAGES.length];
  const originalPrice = roundMarketPrice(
    currentPrice / (1 - discountPercent / 100),
  );

  return {
    currentPrice,
    originalPrice: Math.max(originalPrice, currentPrice + PRICE_STEP),
    discountPercent,
  };
}
