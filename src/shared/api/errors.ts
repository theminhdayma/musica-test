export class ApiError extends Error {
  statusCode: number
  code: string
  requestId?: string
  details?: unknown

  constructor(input: { statusCode: number; code: string; message: string; requestId?: string; details?: unknown }) {
    super(input.message)
    this.name = 'ApiError'
    this.statusCode = input.statusCode
    this.code = input.code
    this.requestId = input.requestId
    this.details = input.details
  }
}

export class NetworkError extends Error {
  constructor(message = 'Network error') {
    super(message)
    this.name = 'NetworkError'
  }
}

