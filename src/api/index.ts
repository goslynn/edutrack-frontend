// ── Barrel del módulo api ────────────────────────────────────────────

// Result pattern
export { ok, err, isOk, isErr, unwrap, unwrapOr, mapResult } from './result'
export type { Result, Ok, Err } from './result'

// Cliente HTTP genérico
export { createHttpClient, HttpError } from './http-client'
export type {
  HttpClient,
  HttpClientConfig,
  HttpMethod,
  HttpFailure,
  RequestConfig,
  RequestOptions,
  ResponseType,
  RetryPolicy,
  RetrySpec,
  Backoff,
} from './http-client'

// Transporte y query string
export type { HttpTransport } from './http-transport'
export { buildQueryString } from './query-string'
export type { QueryParams, QueryValue } from './query-string'

// Cliente específico de EduTrack
export { createEdutrackClient, api } from './client'
export type { EdutrackClient } from './client'

// Errores de dominio
export { ApiError, isErrorResponse, failureToError } from './errors'
export type { ErrorResponse } from './errors'

// Recursos
export { login } from './auth'
export type { LoginRequest, LoginResponse, AuthResult } from './auth'
