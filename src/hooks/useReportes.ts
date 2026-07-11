// ── Hook de feature: Reportes ─────────────────────────────────────────
// Orquesta el catálogo, la ejecución y la bitácora de auditoría vía el BFF
// (`/bff/reportes`). El detalle de cada definición (parameters) se carga y
// cachea perezosamente al seleccionarla; el historial se carga perezosamente
// al abrir la pestaña "Historial" (no en cada visita a la página).

import { useCallback, useEffect, useRef, useState } from 'react'

import { getDefinition, getDefinitions, getExecutions, runReportDownload, runReportPreview } from '@/api/reportes'
import { failureToError } from '@/api/errors'
import type { HttpFailure } from '@/api/http-client'
import type { ErrorResponse } from '@/api/errors'
import type {
  PermMap,
  ReportDefinitionDetail,
  ReportDefinitionSummary,
  ReportExecution,
  ReportFormat,
  RunResult,
} from '@/types/reportes'
import { reportFilename } from '@/components/reportes/reportes-meta'

const toMsg = (failure: HttpFailure<ErrorResponse>): string => failureToError(failure).message

export type DetailOutcome = { detail: ReportDefinitionDetail } | { error: string }
export type RunOutcome = { result: RunResult } | { error: string }

// Todos los permisos habilitados: RBAC por rol se resuelve en una fase posterior.
const ALL_ENABLED: PermMap = { execute: 'enabled', historial: 'enabled' }

interface UseReportesState {
  definitions: ReportDefinitionSummary[]
  loading: boolean
  error: string | null
  executions: ReportExecution[]
  executionsLoading: boolean
}

export interface UseReportesReturn extends UseReportesState {
  perms: PermMap
  getDefinitionDetail: (id: string) => Promise<DetailOutcome>
  run: (definitionId: string, format: ReportFormat, parameters: Record<string, string>) => Promise<RunOutcome>
  loadExecutions: () => void
}

export function useReportes(): UseReportesReturn {
  const [state, setState] = useState<UseReportesState>({
    definitions: [],
    loading: true,
    error: null,
    executions: [],
    executionsLoading: false,
  })

  // Cache de detalle por id: evita recargar `parameters` al volver a un reporte ya visto.
  const detailCache = useRef<Map<string, ReportDefinitionDetail>>(new Map())

  useEffect(() => {
    let active = true
    void (async () => {
      const res = await getDefinitions()
      if (!active) return
      setState((prev) =>
        res.ok
          ? { ...prev, definitions: res.value, loading: false, error: null }
          : { ...prev, loading: false, error: toMsg(res.error) },
      )
    })()
    return () => {
      active = false
    }
  }, [])

  const getDefinitionDetail = useCallback(async (id: string): Promise<DetailOutcome> => {
    const cached = detailCache.current.get(id)
    if (cached) return { detail: cached }
    const res = await getDefinition(id)
    if (!res.ok) return { error: toMsg(res.error) }
    detailCache.current.set(id, res.value)
    return { detail: res.value }
  }, [])

  const run = useCallback(
    async (definitionId: string, format: ReportFormat, parameters: Record<string, string>): Promise<RunOutcome> => {
      if (format === 'JSON') {
        const res = await runReportPreview(definitionId, parameters)
        if (!res.ok) return { error: toMsg(res.error) }
        return { result: { kind: 'preview', rows: res.value } }
      }

      const res = await runReportDownload(definitionId, format, parameters)
      if (!res.ok) return { error: toMsg(res.error) }

      const reportKey =
        detailCache.current.get(definitionId)?.reportKey ??
        state.definitions.find((d) => d.id === definitionId)?.reportKey ??
        definitionId
      return { result: { kind: 'file', format, blob: res.value, filename: reportFilename(reportKey, format) } }
    },
    [state.definitions],
  )

  const loadExecutions = useCallback(() => {
    setState((prev) => ({ ...prev, executionsLoading: true }))
    void (async () => {
      const res = await getExecutions()
      setState((prev) =>
        res.ok
          ? { ...prev, executions: res.value, executionsLoading: false }
          : { ...prev, executionsLoading: false, error: toMsg(res.error) },
      )
    })()
  }, [])

  return { ...state, perms: ALL_ENABLED, getDefinitionDetail, run, loadExecutions }
}
