import { p as products } from "./catalog-7r_b5cgQ.js";
function stableUuidFromString(input) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const bytes = new Uint8Array(16);
  let x = h >>> 0;
  for (let i = 0; i < 16; i += 1) {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    bytes[i] = x & 255;
  }
  bytes[6] = bytes[6] & 15 | 64;
  bytes[8] = bytes[8] & 63 | 128;
  const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
const internalToPublic = /* @__PURE__ */ new Map();
const publicToInternal = /* @__PURE__ */ new Map();
for (const p of products) {
  const internalId = String(p.id);
  const publicId = stableUuidFromString(`product:${internalId}`);
  internalToPublic.set(internalId, publicId);
  publicToInternal.set(publicId, internalId);
}
function toPublicProductId(internalId) {
  return internalToPublic.get(internalId) || internalId;
}
function toInternalProductId(publicIdOrInternalId) {
  return publicToInternal.get(publicIdOrInternalId) || publicIdOrInternalId;
}
export {
  toPublicProductId as a,
  toInternalProductId as t
};
