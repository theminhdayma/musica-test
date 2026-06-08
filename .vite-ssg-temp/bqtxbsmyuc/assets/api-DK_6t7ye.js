import { p as products } from "./catalog-7r_b5cgQ.js";
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
function mockCertificates() {
  const now = /* @__PURE__ */ new Date();
  return products.slice(0, 6).map((p, idx) => {
    const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    const createdAt = new Date(now.getTime() - idx * 864e5).toISOString();
    return {
      id,
      productId: p.id,
      productCode: p.isrc ? String(p.isrc) : `PROD-${String(p.id).slice(0, 6).padStart(6, "0")}`,
      productTitle: p.title,
      artistDisplayName: p.artist,
      status: "ACTIVE",
      validFrom: createdAt,
      validUntil: null,
      createdAt
    };
  });
}
async function listMyCertificates(input) {
  {
    const page = input.page || 1;
    const pageSize = input.pageSize || 20;
    const q = (input.q || "").trim().toLowerCase();
    const all = mockCertificates();
    const filtered = all.filter((it) => !q || it.productTitle.toLowerCase().includes(q) || it.productCode.toLowerCase().includes(q));
    const { slice, meta } = paginate(filtered, page, pageSize);
    const data = { items: slice };
    return { data, meta };
  }
}
async function getMyCertificateDetail(certificateId) {
  {
    const found = mockCertificates().find((it) => it.id === certificateId);
    if (!found) throw new Error("NOT_FOUND");
    return { data: found };
  }
}
export {
  getMyCertificateDetail as g,
  listMyCertificates as l
};
