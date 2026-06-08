function isTrue(v: string | undefined) {
  return v === 'true' || v === '1'
}

export const mockFlags = {
  products: isTrue(import.meta.env.VITE_USE_MOCK_PRODUCTS),
  purchase: isTrue(import.meta.env.VITE_USE_MOCK_PURCHASE),
  certificates: isTrue(import.meta.env.VITE_USE_MOCK_CERTIFICATES),
  meProducts: isTrue(import.meta.env.VITE_USE_MOCK_ME_PRODUCTS)
}

