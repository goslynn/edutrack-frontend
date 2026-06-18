/**
 * Tipos de dominio para la gestión de usuarios (Configuración → Usuarios).
 *
 * Reflejan el shape que entrega el Auth Service vía el BFF (`/bff/configuracion`):
 *  - `AuthUser` ≈ `UserResponse` en la vista `List` (id, email, displayName,
 *    enabled, roleIds). Las marcas de tiempo solo viajan en vistas Detailed/Admin,
 *    por eso son opcionales aquí.
 *  - `AuthRole` ≈ `RoleResponse` en la vista `List` (id, name, description).
 *
 * La capa visual NO consume estos tipos directamente para presentación derivada
 * (estado activo/inhabilitado, etiquetas de rol): eso se compone en el componente.
 */

export interface AuthUser {
  id: string
  email: string
  displayName: string
  enabled: boolean
  /** UUIDs de los roles asignados (Auth los entrega en la vista List/Extra). */
  roleIds: string[]
  createdAt?: string
  updatedAt?: string
}

export interface AuthRole {
  id: string
  name: string
  description?: string
}

/** Alta de usuario: credenciales + datos + roles iniciales a asignar. */
export interface CreateUserInput {
  email: string
  password: string
  displayName: string
  roleIds: string[]
}

/** Edición de usuario: solo lo que Auth acepta en su PUT (displayName, enabled). */
export interface UpdateUserInput {
  displayName?: string
  enabled?: boolean
}

/** Permiso Unix-style de un rol sobre un recurso (PermissionResponse de Auth). */
export interface AuthPermission {
  roleId: string
  resourceKey: string
  flags: number
  flagsLabel: string
}

/** Catálogo de recursos tal como devuelve GET /bff/configuracion/resources. */
export interface ResourceCatalogResponse {
  auth: ServiceResources
  course?: ServiceResources
  student?: ServiceResources
  attendance?: ServiceResources
  annotation?: ServiceResources
  assessment?: ServiceResources
}

export interface ServiceResources {
  data: string[]
  meta: { service: string; count: number }
}
