import { useState } from "react"
import { CircleAlertIcon, CircleCheckIcon, HistoryIcon, SearchIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import type { ExecutionStatus, ReportExecution } from "@/types/reportes"
import { FORMAT_META, fmtDateTime } from "./reportes-meta"

interface HistorialPanelProps {
  executions: ReportExecution[]
  loading: boolean
}

/** Bitácora de ejecuciones auditadas: buscable/filtrable por estado. */
export function HistorialPanel({ executions, loading }: HistorialPanelProps) {
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | ExecutionStatus>("all")

  const filtered = executions.filter((e) => {
    if (statusFilter !== "all" && e.status !== statusFilter) return false
    if (!query.trim()) return true
    return e.reportKey.toLowerCase().includes(query.toLowerCase())
  })

  return (
    <div>
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3.5">
        <p className="text-[12.5px] text-muted">{executions.length} ejecuciones registradas</p>
        <div className="flex flex-wrap gap-2.5">
          <div className="flex min-w-[220px] items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-muted">
            <SearchIcon className="size-4 flex-none" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por reporte…"
              className="w-full border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | ExecutionStatus)}
            aria-label="Estado"
            wrapperClassName="min-w-[150px]"
          >
            <option value="all">Todos los estados</option>
            <option value="SUCCESS">Exitosas</option>
            <option value="FAILED">Fallidas</option>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-background ring-1 ring-foreground/10">
        <table className="w-full border-collapse">
          <thead>
            <tr className="[&>th]:border-b [&>th]:border-border [&>th]:bg-surface [&>th]:px-4 [&>th]:py-3 [&>th]:text-left [&>th]:text-[11.5px] [&>th]:font-semibold [&>th]:tracking-[0.05em] [&>th]:text-muted [&>th]:uppercase">
              <th>Reporte</th>
              <th>Formato</th>
              <th>Filas</th>
              <th>Ejecutado</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr
                key={e.id}
                className="border-b border-border text-[13.5px] last:border-b-0 hover:bg-surface/55 [&>td]:px-4 [&>td]:py-[11px] [&>td]:align-middle"
              >
                <td className="font-mono">{e.reportKey}</td>
                <td>
                  <Badge variant="neutral">{FORMAT_META[e.format].label}</Badge>
                </td>
                <td className="font-mono tabular-nums">{e.rowCount ?? "—"}</td>
                <td>{fmtDateTime(e.executedAt)}</td>
                <td>
                  {e.status === "SUCCESS" ? (
                    <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-success">
                      <CircleCheckIcon className="size-[15px]" /> Exitosa
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-danger"
                      title={e.errorMessage ?? undefined}
                    >
                      <CircleAlertIcon className="size-[15px]" /> Fallida
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading ? (
          <div className="p-12 text-center text-[13.5px] text-muted">Cargando…</div>
        ) : (
          filtered.length === 0 && (
            <div className="flex flex-col items-center gap-2.5 p-12 text-center text-[13.5px] text-muted">
              <HistoryIcon className="size-[22px] text-border" />
              <div>Sin ejecuciones registradas.</div>
            </div>
          )
        )}
      </div>
    </div>
  )
}
