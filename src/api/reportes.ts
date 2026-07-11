// ── Recurso Reportes ──────────────────────────────────────────────────
// Llamadas al BFF (`/bff/reportes/*`), proxy directo a MS-Report (catálogo,
// ejecución y bitácora de auditoría). Todas devuelven `Result`; la capa de
// hooks decide cómo mostrar el fallo.

import { api } from '@/api/client'
import type { HttpTransport } from '@/api/http-transport'
import type { HttpFailure } from '@/api/http-client'
import type { ErrorResponse } from '@/api/errors'
import type { Result } from '@/api/result'
import type {
  ReportDefinitionDetail,
  ReportDefinitionSummary,
  ReportExecution,
  ReportFormat,
  ReportRow,
} from '@/types/reportes'

export type ApiResult<T> = Result<T, HttpFailure<ErrorResponse>>

const BASE = '/bff/reportes'

// ── Catálogo ──────────────────────────────────────────────────────────

export function getDefinitions(
  client: HttpTransport = api,
): Promise<ApiResult<ReportDefinitionSummary[]>> {
  return client.get<ReportDefinitionSummary[], ErrorResponse>(`${BASE}/definitions`)
}

export function getDefinition(
  id: string,
  client: HttpTransport = api,
): Promise<ApiResult<ReportDefinitionDetail>> {
  return client.get<ReportDefinitionDetail, ErrorResponse>(`${BASE}/definitions/${id}`)
}

// ── Ejecución ─────────────────────────────────────────────────────────

// format=JSON no es una descarga: el backend devuelve el arreglo de filas inline.
export function runReportPreview(
  definitionId: string,
  parameters: Record<string, string>,
  client: HttpTransport = api,
): Promise<ApiResult<ReportRow[]>> {
  return client.post<ReportRow[], ErrorResponse>(
    `${BASE}/executions/run/${definitionId}`,
    { parameters },
    { query: { format: 'JSON' } },
  )
}

// format=CSV/PDF es una descarga; el cuerpo llega como blob (su `.type` ya trae
// el Content-Type real que devolvió el backend).
export function runReportDownload(
  definitionId: string,
  format: Extract<ReportFormat, 'CSV' | 'PDF'>,
  parameters: Record<string, string>,
  client: HttpTransport = api,
): Promise<ApiResult<Blob>> {
  return client.post<Blob, ErrorResponse>(
    `${BASE}/executions/run/${definitionId}`,
    { parameters },
    { query: { format }, responseType: 'blob' },
  )
}

// ── Bitácora de auditoría ─────────────────────────────────────────────

export function getExecutions(
  definitionId?: string,
  limit?: number,
  client: HttpTransport = api,
): Promise<ApiResult<ReportExecution[]>> {
  return client.get<ReportExecution[], ErrorResponse>(`${BASE}/executions`, {
    query: { definitionId, limit },
  })
}
