import { p as products } from "./catalog-BTAmee6Y.js";
function paginate(items, page, pageSize) {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const slice = items.slice(start, start + pageSize);
  const meta = {
    pagination: {
      page: safePage,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPrevPage: safePage > 1
    }
  };
  return { slice, meta };
}
function mapMyProduct(p) {
  return {
    id: p.id,
    productCode: p.isrc ? String(p.isrc) : `PROD-${String(p.id).slice(0, 6).padStart(6, "0")}`,
    title: p.title,
    thumbnailUrl: p.cover || null,
    status: "PUBLISHED",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
async function listMyProducts(input) {
  {
    const page = input.page || 1;
    const pageSize = input.pageSize || 20;
    const q = (input.q || "").trim().toLowerCase();
    const items = products.filter((p) => !q || String(p.title || "").toLowerCase().includes(q)).map(mapMyProduct);
    const { slice, meta } = paginate(items, page, pageSize);
    const data = { items: slice };
    return { data, meta };
  }
}
async function getMyProductDetail(productId) {
  {
    const found = products.find((p) => p.id === productId);
    if (!found) throw new Error("NOT_FOUND");
    const data = { ...mapMyProduct(found), description: found.description };
    return { data };
  }
}
export {
  getMyProductDetail as g,
  listMyProducts as l
};
