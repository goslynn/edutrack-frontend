// ── Recurso Auth ─────────────────────────────────────────────────────
// Llamadas al Auth Service vía el cliente específico. Devuelven `Result`
// (no lanzan); la capa de hooks decide cómo mostrar el fallo.

import { api } from '@/api/client'
import type { HttpTransport } from '@/api/http-transport'
import type { HttpFailure } from '@/api/http-client'
import type { ErrorResponse } from '@/api/errors'
import type { Result } from '@/api/result'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
}

export type AuthResult<T> = Result<T, HttpFailure<ErrorResponse>>

// POST /auth/login
export function login(
  credentials: LoginRequest,
  client: HttpTransport = api,
): Promise<AuthResult<LoginResponse>> {
  return client.post<LoginResponse, ErrorResponse>('/auth/login', credentials)
}
