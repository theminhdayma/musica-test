import type { ApiErrorResponse, ApiSuccessResponse } from './contracts'
import { ApiError, NetworkError } from './errors'

type AccessTokenGetter = () => string | null | undefined

let getAccessToken: AccessTokenGetter | undefined

export function setAccessTokenGetter(fn: AccessTokenGetter) {
  getAccessToken = fn
}

export function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL || ''
}

export async function apiRequest<TData, TMeta = undefined>(input: {
  path: string
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  query?: Record<string, string | number | boolean | undefined | null>
  body?: unknown
  headers?: Record<string, string | undefined>
  baseUrlOverride?: string
}): Promise<{ data: TData; meta?: TMeta; requestId: string; timestamp: string }> {
  const baseUrl = (input.baseUrlOverride ?? getApiBaseUrl()).replace(/\/$/, '')
  const url = new URL(baseUrl + input.path)

  if (input.query) {
    for (const [k, v] of Object.entries(input.query)) {
      if (v === undefined || v === null) continue
      url.searchParams.set(k, String(v))
    }
  }

  const token = getAccessToken?.()
  const requestId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(input.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'x-request-id': requestId,
    ...(input.headers ? Object.fromEntries(Object.entries(input.headers).filter(([, v]) => v !== undefined)) : {})
  }

  let res: Response
  try {
    res = await fetch(url, {
      method: input.method || 'GET',
      headers,
      body: input.body ? JSON.stringify(input.body) : undefined
    })
  } catch {
    throw new NetworkError()
  }

  let json: ApiSuccessResponse<TData, TMeta> | ApiErrorResponse
  try {
    json = await res.json()
  } catch {
    throw new ApiError({ statusCode: res.status, code: 'INVALID_JSON', message: 'Invalid JSON response' })
  }

  if (json.success) {
    return { data: json.data, meta: json.meta, requestId: json.requestId, timestamp: json.timestamp }
  }

  throw new ApiError({
    statusCode: json.statusCode,
    code: json.error.code,
    message: json.error.message,
    requestId: json.requestId,
    details: json.error.details
  })
}

