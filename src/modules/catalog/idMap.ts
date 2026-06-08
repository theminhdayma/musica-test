import { products as mockProducts } from '../../data/catalog'

function stableUuidFromString(input: string) {
  let h = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }

  const bytes = new Uint8Array(16)
  let x = h >>> 0
  for (let i = 0; i < 16; i += 1) {
    x ^= x << 13
    x ^= x >>> 17
    x ^= x << 5
    bytes[i] = x & 0xff
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80

  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

const internalToPublic = new Map<string, string>()
const publicToInternal = new Map<string, string>()

for (const p of mockProducts as any[]) {
  const internalId = String(p.id)
  const publicId = stableUuidFromString(`product:${internalId}`)
  internalToPublic.set(internalId, publicId)
  publicToInternal.set(publicId, internalId)
}

export function toPublicProductId(internalId: string) {
  return internalToPublic.get(internalId) || internalId
}

export function toInternalProductId(publicIdOrInternalId: string) {
  return publicToInternal.get(publicIdOrInternalId) || publicIdOrInternalId
}

