/**
 * Tipos del modelo de dominio de «Reportes». Reflejan el shape que en producción
 * entrega MS-Report vía el BFF (`/bff/reportes`): catálogo de definiciones
 * (consulta + filtros + formatos admitidos), su ejecución (preview JSON o
 * descarga CSV/PDF) y la bitácora de auditoría de ejecuciones.
 *
 * `reportKey` sigue la convención `<dominio>.<reporte>` del backend (p. ej.
 * `academico.rendimiento-curso`); el dominio se deriva de ese prefijo en la
 * capa de componentes (`reportes-meta.ts`), no viaja como campo aparte.
 *
 * RBAC se modela como estado por acción: "enabled" | "disabled" | "hidden".
 */

export type RowState = "enabled" | "disabled" | "hidden"

export type ParamType =
  | "STRING"
  | "INTEGER"
  | "DECIMAL"
  | "BOOLEAN"
  | "DATE"
  | "TIMESTAMP"
  | "UUID"

export type ReportFormat = "JSON" | "CSV" | "PDF"

export interface ReportParameter {
  id: string
  name: string
  label: string
  type: ParamType
  required: boolean
  defaultValue: string | null
  orderIndex: number
}

/** Catálogo (`GET /definitions`): vista List, sin `parameters`. */
export interface ReportDefinitionSummary {
  id: string
  reportKey: string
  name: string
  description: string
  supportedFormats: ReportFormat[]
  enabled: boolean
  hasTemplate: boolean
}

/** Detalle (`GET /definitions/:id`): vista Detailed, agrega `parameters`. */
export interface ReportDefinitionDetail extends ReportDefinitionSummary {
  parameters: ReportParameter[]
}

export type ExecutionStatus = "SUCCESS" | "FAILED"

/** Fila de la bitácora de auditoría (`GET /executions`). */
export interface ReportExecution {
  id: string
  definitionId: string | null
  reportKey: string
  format: ReportFormat
  status: ExecutionStatus
  rowCount: number | null
  executedBy: string
  executedAt: string
  /** Solo presentes cuando el backend expone la vista Detailed. */
  parameters?: Record<string, unknown>
  errorMessage?: string | null
}

/** Fila del preview JSON: mapa columna → valor, tal como lo serializa el MS. */
export type ReportRow = Record<string, unknown>

/** Resultado de ejecutar un reporte: vista previa en pantalla o archivo descargable. */
export type RunResult =
  | { kind: "preview"; rows: ReportRow[] }
  | { kind: "file"; format: Extract<ReportFormat, "CSV" | "PDF">; blob: Blob; filename: string }

/** Acciones gobernadas por RBAC. */
export type PermAction = "execute" | "historial"
export type PermMap = Record<PermAction, RowState>
