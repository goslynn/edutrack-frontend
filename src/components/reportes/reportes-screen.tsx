import { useRef, useState } from "react"

import { Alert } from "@/components/ui/alert"
import { Tabs } from "@/components/ui/tabs"
import type {
  PermMap,
  ReportDefinitionSummary,
  ReportExecution,
  ReportFormat,
} from "@/types/reportes"
import type { DetailOutcome, RunOutcome } from "@/hooks/useReportes"
import { EmisionPanel } from "./emision-panel"
import { HistorialPanel } from "./historial-panel"

type ToastVariant = "success" | "info" | "warning" | "danger"
type Toast = { variant: ToastVariant; msg: string; k: number } | null

interface ReportesScreenProps {
  definitions: ReportDefinitionSummary[]
  perms: PermMap
  loading?: boolean
  error?: string | null
  getDetail: (id: string) => Promise<DetailOutcome>
  onRun: (definitionId: string, format: ReportFormat, parameters: Record<string, string>) => Promise<RunOutcome>
  executions: ReportExecution[]
  executionsLoading: boolean
  onOpenHistorial: () => void
}

/**
 * Pantalla «Reportes»: emisión (catálogo + filtros + ejecución) e historial
 * (bitácora de ejecuciones auditadas) como pestañas de una misma vista. El
 * estado de dominio llega del hook vía la página; aquí solo vive el estado
 * UI (pestaña activa, toasts).
 */
export function ReportesScreen({
  definitions,
  perms,
  loading,
  error,
  getDetail,
  onRun,
  executions,
  executionsLoading,
  onOpenHistorial,
}: ReportesScreenProps) {
  const [tab, setTab] = useState("emision")
  const [toast, setToast] = useState<Toast>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const flash = (variant: ToastVariant, msg: string) => {
    setToast({ variant, msg, k: Date.now() })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3600)
  }

  const changeTab = (value: string) => {
    setTab(value)
    if (value === "historial") onOpenHistorial()
  }

  const tabs = [
    { value: "emision", label: "Emisión" },
    ...(perms.historial !== "hidden"
      ? [{ value: "historial", label: "Historial", count: executions.length || undefined }]
      : []),
  ]

  return (
    <div className="mx-auto max-w-[1220px] px-8 pt-[26px] pb-[72px]">
      <header className="mb-[18px] flex flex-wrap items-start justify-between gap-5">
        <div>
          <h1 className="text-2xl leading-tight font-semibold tracking-tight">Reportes</h1>
          <p className="mt-2 max-w-[68ch] text-sm text-muted text-pretty">
            Emite los reportes del sistema en el formato que necesites. Elige un reporte del
            catálogo, completa sus filtros y ejecútalo — la salida se muestra como vista previa en
            pantalla o se descarga como archivo (CSV / PDF).
          </p>
        </div>
      </header>

      <div className="mb-[18px]">
        <Tabs tabs={tabs} value={tab} onValueChange={changeTab} />
      </div>

      {error && (
        <div className="mb-3.5">
          <Alert variant="danger">{error}</Alert>
        </div>
      )}

      {toast && (
        <div className="mb-3.5" key={toast.k}>
          <Alert variant={toast.variant}>{toast.msg}</Alert>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-[13.5px] text-muted">Cargando…</div>
      ) : tab === "emision" ? (
        <EmisionPanel definitions={definitions} perms={perms} getDetail={getDetail} onRun={onRun} flash={flash} />
      ) : (
        <HistorialPanel executions={executions} loading={executionsLoading} />
      )}
    </div>
  )
}
