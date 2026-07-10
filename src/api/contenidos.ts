// ── Recurso Contenido ─────────────────────────────────────────────────
// Llamadas al BFF (`/bff/contenidos/*`), que proxea a MS-Content. El
// composite GET devuelve la jerarquía completa (levels + nodes + files) en
// un solo round-trip; el explorador navega ese árbol en cliente, tal como
// el diseño. Las mutaciones van por rutas individuales.
// Todas devuelven `Result`; la capa de hooks decide cómo mostrar el fallo.

import { api } from '@/api/client'
import type { HttpTransport } from '@/api/http-transport'
import type { HttpFailure } from '@/api/http-client'
import type { ErrorResponse } from '@/api/errors'
import type { Result } from '@/api/result'
import type { ContentFile, ContentNode, DownloadLink, Level } from '@/types/contenidos'

export type ApiResult<T> = Result<T, HttpFailure<ErrorResponse>>

const BASE = '/bff/contenidos'

// ── Tipos de request ──────────────────────────────────────────────────

interface NodeCreateBody {
  name: string
  description: string
  orderIndex: number
  levelId: string
  parentId: string | null
}

interface NodeUpdateBody {
  name: string
  description: string
  orderIndex: number
}

interface ReorderBody {
  parentId: string | null
  orderedIds: string[]
}

// ── Bundle composite ──────────────────────────────────────────────────

// El BFF compone la jerarquía (no hay endpoint de árbol completo en el MS):
// entrega niveles, nodos y archivos en el mismo round-trip.
export interface ContenidosBundle {
  levels: Level[]
  nodes: ContentNode[]
  files: ContentFile[]
}

export function getContenidosBundle(
  client: HttpTransport = api,
): Promise<ApiResult<ContenidosBundle>> {
  return client.get<ContenidosBundle, ErrorResponse>(BASE)
}

// ── Node CRUD ─────────────────────────────────────────────────────────

export function createNode(
  body: NodeCreateBody,
  client: HttpTransport = api,
): Promise<ApiResult<ContentNode>> {
  return client.post<ContentNode, ErrorResponse>(`${BASE}/nodes`, body)
}

export function updateNode(
  id: string,
  body: NodeUpdateBody,
  client: HttpTransport = api,
): Promise<ApiResult<ContentNode>> {
  return client.put<ContentNode, ErrorResponse>(`${BASE}/nodes/${id}`, body)
}

// El backend borra en cascada el subárbol (nodos hijos + archivos).
export function deleteNode(
  id: string,
  client: HttpTransport = api,
): Promise<ApiResult<void>> {
  return client.delete<void, ErrorResponse>(`${BASE}/nodes/${id}`, { responseType: 'none' })
}

// Reordena nodos hermanos (orderIndex) en una sola operación.
export function reorderNodes(
  body: ReorderBody,
  client: HttpTransport = api,
): Promise<ApiResult<void>> {
  return client.put<void, ErrorResponse>(`${BASE}/nodes/reorder`, body, { responseType: 'none' })
}

// ── File sub-resource ─────────────────────────────────────────────────

// Subida multipart al nodo hoja. El cliente ya validó el tamaño (500 MB);
// el backend revalida y responde 413 CONTENT.FILE.TOO_LARGE si se supera.
export function uploadFiles(
  nodeId: string,
  files: File[],
  client: HttpTransport = api,
): Promise<ApiResult<ContentFile[]>> {
  const form = new FormData()
  for (const f of files) form.append('files', f, f.name)
  return client.post<ContentFile[], ErrorResponse>(`${BASE}/nodes/${nodeId}/files`, form)
}

export function deleteFile(
  id: string,
  client: HttpTransport = api,
): Promise<ApiResult<void>> {
  return client.delete<void, ErrorResponse>(`${BASE}/files/${id}`, { responseType: 'none' })
}

// Descarga en dos pasos: primero se pide el enlace pre-firmado, luego el
// cliente descarga desde él. Esto solo obtiene el enlace (paso 1).
export function getDownloadLink(
  id: string,
  client: HttpTransport = api,
): Promise<ApiResult<DownloadLink>> {
  return client.get<DownloadLink, ErrorResponse>(`${BASE}/files/${id}/link`)
}
