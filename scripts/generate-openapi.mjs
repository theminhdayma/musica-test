import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import openapiTS from 'openapi-typescript'

const schemaUrl = process.env.OPENAPI_URL || process.env.VITE_OPENAPI_URL

if (!schemaUrl) {
  console.error('Missing OPENAPI_URL (or VITE_OPENAPI_URL)')
  process.exit(1)
}

const res = await fetch(schemaUrl)
if (!res.ok) {
  console.error(`Failed to fetch OpenAPI schema: ${res.status} ${res.statusText}`)
  process.exit(1)
}

const schema = await res.json()
const output = await openapiTS(schema)

const outDir = path.resolve('src/shared/api/generated')
await fs.mkdir(outDir, { recursive: true })
await fs.writeFile(path.join(outDir, 'openapi.d.ts'), output)

console.log('Generated: src/shared/api/generated/openapi.d.ts')

