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
  AuthPermission,
  AuthRole,
  AuthUser,
  CreateUserInput,
  ResourceCatalogResponse,
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

// POST /bff/configuracion/roles
export function createRole(
  body: { name: string; description?: string },
  client: HttpTransport = api,
): Promise<ApiResult<AuthRole>> {
  return client.post<AuthRole, ErrorResponse>(`${BASE}/roles`, body)
}

// PUT /bff/configuracion/roles/:id
export function updateRole(
  id: string,
  body: { name: string; description?: string },
  client: HttpTransport = api,
): Promise<ApiResult<AuthRole>> {
  return client.put<AuthRole, ErrorResponse>(`${BASE}/roles/${id}`, body)
}

// DELETE /bff/configuracion/roles/:id
export function deleteRole(
  id: string,
  client: HttpTransport = api,
): Promise<ApiResult<void>> {
  return client.delete<void, ErrorResponse>(`${BASE}/roles/${id}`, { responseType: 'none' })
}

// ── Permissions per role ──────────────────────────────────────────────

// GET /bff/configuracion/roles/:id/permissions
export function listRolePermissions(
  roleId: string,
  client: HttpTransport = api,
): Promise<ApiResult<AuthPermission[]>> {
  return client.get<AuthPermission[], ErrorResponse>(`${BASE}/roles/${roleId}/permissions`)
}

// PUT /bff/configuracion/roles/:id/permissions/:resourceKey
export function upsertRolePermission(
  roleId: string,
  resourceKey: string,
  flags: number,
  client: HttpTransport = api,
): Promise<ApiResult<AuthPermission>> {
  return client.put<AuthPermission, ErrorResponse>(
    `${BASE}/roles/${roleId}/permissions/${encodeURIComponent(resourceKey)}`,
    { flags },
  )
}

// DELETE /bff/configuracion/roles/:id/permissions/:resourceKey
export function deleteRolePermission(
  roleId: string,
  resourceKey: string,
  client: HttpTransport = api,
): Promise<ApiResult<void>> {
  return client.delete<void, ErrorResponse>(
    `${BASE}/roles/${roleId}/permissions/${encodeURIComponent(resourceKey)}`,
    { responseType: 'none' },
  )
}

// ── Resource catalog ──────────────────────────────────────────────────

// GET /bff/configuracion/resources
export function getResourceCatalog(
  client: HttpTransport = api,
): Promise<ApiResult<ResourceCatalogResponse>> {
  return client.get<ResourceCatalogResponse, ErrorResponse>(`${BASE}/resources`)
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
