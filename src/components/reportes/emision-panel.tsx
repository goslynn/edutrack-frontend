import { useEffect, useState } from "react"
import { InfoIcon, LockIcon, Loader2Icon, PlayIcon, TriangleAlertIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import type {
  PermMap,
  ReportDefinitionDetail,
  ReportDefinitionSummary,
  ReportFormat,
  RunResult,
} from "@/types/reportes"
import type { DetailOutcome, RunOutcome } from "@/hooks/useReportes"
import { CatalogList } from "./catalog-list"
import { FormatPicker } from "./format-picker"
import { ParamField } from "./param-field"
import { ResultView } from "./result-view"
import { domainMeta } from "./reportes-meta"

type Flash = (variant: "success" | "info" | "warning" | "danger", msg: string) => void

interface EmisionPanelProps {
  definitions: ReportDefinitionSummary[]
  perms: PermMap
  getDetail: (id: string) => Promise<DetailOutcome>
  onRun: (definitionId: string, format: ReportFormat, parameters: Record<string, string>) => Promise<RunOutcome>
  flash: Flash
}

/** Emisión: catálogo (izq) + emisor de filtros/formato/resultado (der). */
export function EmisionPanel({ definitions, perms, getDetail, onRun, flash }: EmisionPanelProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<ReportDefinitionDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [format, setFormat] = useState<ReportFormat | null>(null)
  const [values, setValues] = useState<Record<string, string>>({})
  const [missing, setMissing] = useState<string[]>([])
  const [runError, setRunError] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<RunResult | null>(null)

  // Selección inicial: el primer reporte del catálogo, una sola vez.
  useEffect(() => {
    if (!selectedId && definitions.length) setSelectedId(definitions[0].id)
  }, [definitions, selectedId])

  // Al cambiar de reporte: carga su detalle (parameters) y precarga los defaults.
  useEffect(() => {
    if (!selectedId) return
    let active = true
    setDetailLoading(true)
    setDetail(null)
    void (async () => {
      const outcome = await getDetail(selectedId)
      if (!active) return
      setDetailLoading(false)
      if ("error" in outcome) {
        flash("danger", outcome.error)
        return
      }
      setDetail(outcome.detail)
      setFormat(outcome.detail.supportedFormats[0] ?? null)
      const init: Record<string, string> = {}
      for (const p of outcome.detail.parameters) init[p.name] = p.defaultValue ?? ""
      setValues(init)
      setMissing([])
      setRunError(null)
      setResult(null)
    })()
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])

  const setVal = (name: string, v: string) => {
    setValues((prev) => ({ ...prev, [name]: v }))
    setMissing((m) => m.filter((n) => n !== name))
  }

  const changeFormat = (f: ReportFormat) => {
    setFormat(f)
    setResult(null)
    setRunError(null)
  }

  const emit = async () => {
    if (!detail || !format) return
    setResult(null)
    setRunError(null)

    const missingParams = detail.parameters.filter(
      (p) => p.required && !String(values[p.name] ?? "").trim()
    )
    if (missingParams.length) {
      setMissing(missingParams.map((p) => p.name))
      setRunError(`Falta completar: ${missingParams.map((p) => p.label).join(", ")}.`)
      return
    }

    setRunning(true)
    const outcome = await onRun(detail.id, format, values)
    setRunning(false)

    if ("error" in outcome) {
      setRunError(outcome.error)
      return
    }
    setResult(outcome.result)
    flash("success", `Reporte emitido en ${format === "JSON" ? "vista previa" : format}.`)
  }

  if (definitions.length === 0) {
    return (
      <div className="rounded-xl bg-background px-6 py-16 text-center text-[13.5px] text-muted ring-1 ring-foreground/10">
        No hay reportes definidos en el sistema.
      </div>
    )
  }

  const domain = detail ? domainMeta(detail.reportKey) : null
  const DomainIcon = domain?.icon
  const sortedParams = detail ? [...detail.parameters].sort((a, b) => a.orderIndex - b.orderIndex) : []
  const executeState = perms.execute

  return (
    <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[380px_minmax(0,1fr)]">
      <CatalogList definitions={definitions} selectedId={selectedId} onSelect={setSelectedId} />

      <section className="flex min-w-0 flex-col rounded-xl bg-background ring-1 ring-foreground/10">
        {!detail ? (
          <div className="flex items-center justify-center px-6 py-16 text-[13.5px] text-muted">
            {detailLoading ? "Cargando detalle…" : "Selecciona un reporte del catálogo."}
          </div>
        ) : (
          <>
            <header className="flex gap-3.5 border-b border-border px-6 py-[22px]">
              <span
                className={
                  "grid size-[46px] flex-none place-items-center rounded-lg " +
                  (detail.enabled ? "bg-primary-soft text-primary" : "bg-surface text-muted")
                }
              >
                {DomainIcon && <DomainIcon className="size-[22px]" />}
              </span>
              <div className="min-w-0">
                <div className="mb-1 inline-flex items-center gap-1.5 text-[11.5px] font-semibold tracking-[0.05em] text-muted uppercase">
                  {domain?.label}
                </div>
                <h2 className="text-xl leading-tight font-semibold -tracking-[0.015em]">{detail.name}</h2>
                <p className="mt-1.5 max-w-[62ch] text-[13.5px] leading-relaxed text-muted text-pretty">
                  {detail.description}
                </p>
                <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
                  <code className="rounded-sm bg-surface px-2 py-0.5 font-mono text-xs text-foreground">
                    {detail.reportKey}
                  </code>
                </div>
              </div>
            </header>

            {!detail.enabled ? (
              <div className="mx-6 my-5 flex gap-3 rounded-lg bg-surface px-4 py-3.5">
                <LockIcon className="mt-px size-[18px] flex-none text-muted" />
                <div>
                  <div className="text-[13.5px] font-semibold">Reporte no disponible</div>
                  <div className="mt-0.5 text-[12.5px] text-muted">Este reporte está deshabilitado.</div>
                </div>
              </div>
            ) : (
              <>
                <div className="border-b border-border px-6 py-5">
                  <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
                    <span className="text-[11.5px] font-semibold tracking-[0.06em] text-muted uppercase">
                      Formato de salida
                    </span>
                    <span className="text-[12.5px] text-muted">Solo se ofrecen los formatos que este reporte soporta.</span>
                  </div>
                  <FormatPicker supported={detail.supportedFormats} value={format} onChange={changeFormat} />
                </div>

                <div className="border-b border-border px-6 py-5">
                  <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
                    <span className="text-[11.5px] font-semibold tracking-[0.06em] text-muted uppercase">Filtros</span>
                    <span className="text-[12.5px] text-muted">
                      {sortedParams.length === 0
                        ? "Este reporte no requiere filtros."
                        : `${sortedParams.filter((p) => p.required).length} requerido(s) · ${sortedParams.filter((p) => !p.required).length} opcional(es)`}
                    </span>
                  </div>
                  {sortedParams.length === 0 ? (
                    <div className="inline-flex items-center gap-2 rounded-lg border border-dashed border-border px-3.5 py-3 text-[13px] text-muted">
                      Sin parámetros — se ejecuta directamente.
                    </div>
                  ) : (
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-4">
                      {sortedParams.map((p) => (
                        <ParamField
                          key={p.name}
                          param={p}
                          value={values[p.name] ?? ""}
                          invalid={missing.includes(p.name)}
                          onChange={(v) => setVal(p.name, v)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {runError && (
                  <div
                    className={
                      "mx-6 my-5 flex gap-3 rounded-lg px-4 py-3.5 " +
                      (missing.length ? "bg-warning-soft" : "bg-danger-soft")
                    }
                  >
                    {missing.length ? (
                      <TriangleAlertIcon className="mt-px size-[18px] flex-none text-warning-strong" />
                    ) : (
                      <TriangleAlertIcon className="mt-px size-[18px] flex-none text-danger" />
                    )}
                    <div className="text-[13px] text-foreground">{runError}</div>
                  </div>
                )}

                {result && <ResultView result={result} onClear={() => setResult(null)} />}

                <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 text-[12.5px] text-muted">
                    <InfoIcon className="size-[14px] flex-none" />
                    {format === "JSON" ? "Se mostrará una vista previa." : "Se generará un archivo descargable."}
                  </span>
                  {executeState !== "hidden" && (
                    <Button onClick={() => void emit()} disabled={executeState === "disabled" || running}>
                      {running ? (
                        <>
                          <Loader2Icon className="size-4 animate-spin" /> Emitiendo…
                        </>
                      ) : (
                        <>
                          <PlayIcon className="size-4" /> Emitir reporte
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </section>
    </div>
  )
}
