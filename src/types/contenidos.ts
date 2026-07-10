/**
 * Tipos del modelo de dominio de «Contenido». Reflejan el shape que en producción
 * entrega MS-Content vía API Gateway. Su dominio es un ÁRBOL JERÁRQUICO
 * CONFIGURABLE con tres recursos, tal como la API:
 *   · Level (nivel)  → una fila de la jerarquía configurable → /content/levels
 *   · Node  (nodo)   → un ítem concreto del árbol            → /content/nodes
 *   · File  (archivo)→ adjunto de un nodo HOJA               → /content/files
 *
 * La jerarquía NO está hardcodeada: son filas de `content_levels`. Raíz = menor
 * `depth`; hoja = mayor `depth` (solo la hoja admite archivos). El BFF compone el
 * árbol; la capa visual navega nivel por nivel vía `parentId`.
 *
 * RBAC se modela como un estado por acción: "enabled" | "disabled" | "hidden".
 * Lo resuelve el backend (auth) por usuario; la UI nunca explica el porqué.
 */

export type RowState = "enabled" | "disabled" | "hidden"

/** Una fila de la jerarquía configurable (ordenada por `depth`). */
export interface Level {
  id: string
  depth: number
  name: string
  description: string
  createdAt: string
}

/** Un nodo del árbol. `parentId === null` ⇒ raíz. */
export interface ContentNode {
  id: string
  name: string
  description: string
  orderIndex: number
  levelId: string
  parentId: string | null
  createdAt: string
  updatedAt: string
}

/** Un archivo adjunto; solo cuelga de nodos hoja. */
export interface ContentFile {
  id: string
  nodeId: string
  filename: string
  contentType: string
  sizeBytes: number
  createdAt: string
}

/** Enlace de descarga pre-firmado (§5.3), de vida corta. */
export interface DownloadLink {
  url: string
  expiresAt: string
}

/** Acciones gobernadas por RBAC (content.levels / .nodes / .files). */
export type PermAction =
  | "levels.create"
  | "levels.edit"
  | "levels.delete"
  | "nodes.create"
  | "nodes.edit"
  | "nodes.delete"
  | "files.upload"
  | "files.delete"

export type PermMap = Record<PermAction, RowState>

/** Límite del backend: 500 MB por archivo (CONTENT.FILE.TOO_LARGE si se supera). */
export const MAX_FILE_BYTES = 500 * 1024 * 1024

/** Vida del enlace de descarga pre-firmado (~10 min). */
export const DOWNLOAD_TTL_MIN = 10
