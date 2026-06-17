/**
 * Tipos del modelo de dominio de Configuración. Reflejan el shape que en
 * producción entregan Auth y otros microservicios vía API Gateway. La capa
 * visual se tipa contra estos; los datos de muestra viven en
 * `@/data/configuracion-stub` y los mapas/labels de presentación en la capa de
 * componentes.
 *
 * RBAC se modela como un prop por fila: state "enabled" | "disabled" | "hidden".
 */

export type RowState = "enabled" | "disabled" | "hidden"

interface BaseRow {
  id: string
  label: string
  desc?: string
  state: RowState
}

export interface Option {
  value: string
  label: string
}

export interface SegmentedRow extends BaseRow {
  type: "segmented"
  value: string
  options: Option[]
}

export interface SelectRow extends BaseRow {
  type: "select"
  value: string
  options: Option[]
}

export interface SwitchRow extends BaseRow {
  type: "switch"
  checked: boolean
}

export interface ActionRow extends BaseRow {
  type: "action"
  action: {
    label: string
    icon: string
    variant?: "outline" | "destructive" | "default"
  }
}

export interface PanelRow extends BaseRow {
  type: "panel"
  /** Clave de icono (kebab) resuelta a lucide-react en la capa visual. */
  icon: string
  /** Id del panel destino (p. ej. "usuarios"). */
  panel: string
}

export type SettingsRow =
  | SegmentedRow
  | SelectRow
  | SwitchRow
  | ActionRow
  | PanelRow

export interface SettingsSection {
  id: string
  title: string
  desc?: string
  rows: SettingsRow[]
}

/* ============ Usuarios ============ */

export interface UserRole {
  id: string
  label: string
  desc: string
}

export type UserStatus = "activo" | "inhabilitado" | "pendiente"

export interface OrgUser {
  id: string
  name: string
  email: string
  username: string
  roles: string[]
  status: UserStatus
  last: string
  /** El usuario autenticado (no puede inhabilitarse ni eliminarse a sí mismo). */
  you?: boolean
}

/* ============ Roles y permisos ============ */

/** Bit del modelo de permisos (UNIX). La UI lo expone como una casilla. */
export interface PermFlag {
  bit: number
  key: "read" | "write" | "exec"
  label: string
  /** Letra UNIX (r/w/x). */
  short: string
  desc: string
}

export interface Role {
  id: string
  name: string
  desc: string
  /** Rol base: no se puede renombrar ni eliminar, pero sí ajustar sus permisos. */
  system: boolean
  /** Cuántas personas tienen este rol. */
  users: number
}

/** Respuesta tal cual de un microservicio: la lista de sus resources. */
export interface ServiceResources {
  data: string[]
  meta: { service: string; count: number }
}

export interface PermService {
  label: string
  /** Clave de icono (kebab) resuelta a lucide-react en la capa visual. */
  icon: string
  response: ServiceResources
}

/**
 * Permisos asignados por rol: { roleId: { resourceId: flagByte } }. Los recursos
 * ausentes equivalen a 0 (sin permiso).
 */
export type RolePermissions = Record<string, Record<string, number>>
