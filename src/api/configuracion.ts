// ── Recurso Configuración (Usuarios + Roles) ─────────────────────────
// Llamadas al BFF (`/bff/configuracion/*`), que a su vez proxea al Auth
// Service. Se pasa por el BFF —no directo a `/auth`— para mantener un único
// backend de cara a la SPA, coherente con el resto del dashboard. Devuelven
// `Result` (no lanzan); la capa de hooks decide cómo mostrar el fallo.

import { api } from '@/api/client'
import type { HttpTransport } from '@/api/http-transport'
import type { HttpFailure } from '@/api/http-client'
import type { ErrorResponse } from '@/api/errors'
import type { Result } from '@/api/result'
import type {
  AuthRole,
  AuthUser,
  CreateUserInput,
  UpdateUserInput,
} from '@/types/usuarios'

export type ApiResult<T> = Result<T, HttpFailure<ErrorResponse>>

const BASE = '/bff/configuracion'

// ── Usuarios ─────────────────────────────────────────────────────────

// GET /bff/configuracion/users
export function listUsers(client: HttpTransport = api): Promise<ApiResult<AuthUser[]>> {
  return client.get<AuthUser[], ErrorResponse>(`${BASE}/users`)
}

// POST /bff/configuracion/users  → Auth solo recibe email/password/displayName
export function createUser(
  body: Pick<CreateUserInput, 'email' | 'password' | 'displayName'>,
  client: HttpTransport = api,
): Promise<ApiResult<AuthUser>> {
  return client.post<AuthUser, ErrorResponse>(`${BASE}/users`, body)
}

// PUT /bff/configuracion/users/:id
export function updateUser(
  id: string,
  body: UpdateUserInput,
  client: HttpTransport = api,
): Promise<ApiResult<AuthUser>> {
  return client.put<AuthUser, ErrorResponse>(`${BASE}/users/${id}`, body)
}

// DELETE /bff/configuracion/users/:id  → soft-delete (inhabilita)
export function disableUser(id: string, client: HttpTransport = api): Promise<ApiResult<void>> {
  return client.delete<void, ErrorResponse>(`${BASE}/users/${id}`, { responseType: 'none' })
}

// ── Roles ────────────────────────────────────────────────────────────

// GET /bff/configuracion/roles
export function listRoles(client: HttpTransport = api): Promise<ApiResult<AuthRole[]>> {
  return client.get<AuthRole[], ErrorResponse>(`${BASE}/roles`)
}

// ── Asignación de roles a un usuario ─────────────────────────────────

// POST /bff/configuracion/users/:id/roles/:roleId
export function assignRole(
  userId: string,
  roleId: string,
  client: HttpTransport = api,
): Promise<ApiResult<void>> {
  return client.post<void, ErrorResponse>(
    `${BASE}/users/${userId}/roles/${roleId}`,
    undefined,
    { responseType: 'none' },
  )
}

// DELETE /bff/configuracion/users/:id/roles/:roleId
export function revokeRole(
  userId: string,
  roleId: string,
  client: HttpTransport = api,
): Promise<ApiResult<void>> {
  return client.delete<void, ErrorResponse>(
    `${BASE}/users/${userId}/roles/${roleId}`,
    { responseType: 'none' },
  )
}
