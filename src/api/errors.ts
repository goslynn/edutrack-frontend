// ── Errores de dominio ───────────────────────────────────────────────
// Envelope `ErrorResponse` compartido por todos los MS del backend y el
// puente desde el `HttpFailure` genérico hacia un `Error` consumible por la UI.

import type { HttpFailure } from './http-client'

export interface ErrorResponse {
  timestamp: string
  status: number
  error: string
  /** Código estable y switcheable de dominio (p. ej. `AUTH.USER.EMAIL_EXISTS`). */
  code?: string
  message: string
  path?: string
  metadata?: Record<string, unknown>
  trace?: string
}

export function isErrorResponse(value: unknown): value is ErrorResponse {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return typeof v.status === 'number' && typeof v.message === 'string'
}

/** Error que transporta el envelope `ErrorResponse` del backend. */
export class ApiError extends Error {
  readonly response: ErrorResponse

  constructor(response: ErrorResponse) {
    super(response.message)
    this.name = 'ApiError'
    this.response = response
  }

  get status(): number {
    return this.response.status
  }

  get code(): string | undefined {
    return this.response.code
  }
}

/**
 * Convierte un `HttpFailure` genérico en un `Error` con mensaje legible (es-CL).
 * Si el cuerpo de un fallo HTTP trae el envelope del backend, se preserva como
 * `ApiError` (status/code/metadata disponibles para UX).
 */
export function failureToError(failure: HttpFailure): Error {
  switch (failure.kind) {
    case 'http':
      if (isErrorResponse(failure.body)) return new ApiError(failure.body)
      return new ApiError({
        timestamp: new Date().toISOString(),
        status: failure.status,
        error: failure.statusText,
        message: typeof failure.body === 'string' && failure.body ? failure.body : failure.statusText,
      })
    case 'timeout':
      return new Error('La solicitud tardó demasiado y fue cancelada.')
    case 'aborted':
      return new Error('La solicitud fue cancelada.')
    case 'network':
      return new Error('No se pudo conectar con el servidor. Revisa tu conexión.')
    case 'parse':
      return new Error('El servidor respondió en un formato inesperado.')
  }
}
