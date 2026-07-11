import { CircleCheckIcon, DownloadIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { RunResult } from "@/types/reportes"
import { FORMAT_META, fmtBytes, formatCell, previewColumns, triggerDownload } from "./reportes-meta"

interface ResultViewProps {
  result: RunResult
  onClear: () => void
}

/** Salida de una ejecución: tabla de preview (JSON) o tarjeta de archivo listo (CSV/PDF). */
export function ResultView({ result, onClear }: ResultViewProps) {
  if (result.kind === "preview") {
    const columns = previewColumns(result.rows)
    return (
      <div className="border-b border-border px-6 py-5">
        <div className="mb-3.5 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-success">
            <CircleCheckIcon className="size-[15px]" /> Ejecutado
          </span>
          <span className="font-mono text-[12.5px] text-muted tabular-nums">{result.rows.length} filas · Preview</span>
          <div className="ml-auto">
            <Button size="xs" variant="ghost" onClick={onClear}>
              Cerrar
            </Button>
          </div>
        </div>

        {result.rows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-[13px] text-muted">
            El reporte no arrojó filas para estos filtros.
          </div>
        ) : (
          <div className="overflow-auto rounded-lg border border-border">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th
                      key={c}
                      className="border-b border-border bg-surface px-3.5 py-2.5 text-left text-[11px] font-semibold tracking-[0.04em] text-muted uppercase"
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row, i) => (
                  <tr key={i} className="border-b border-border last:border-b-0 hover:bg-surface/55">
                    {columns.map((c, j) => (
                      <td
                        key={c}
                        className={cn("px-3.5 py-2.5 text-[13px]", j > 0 && "font-mono tabular-nums text-right")}
                      >
                        {formatCell(row[c])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-2.5 text-xs leading-relaxed text-muted">
          Vista previa armada en pantalla a partir de la respuesta del backend (formato JSON).
        </p>
      </div>
    )
  }

  const meta = FORMAT_META[result.format]
  const Icon = meta.icon
  return (
    <div className="border-b border-border px-6 py-5">
      <div className="flex items-center gap-3.5 rounded-lg border border-border bg-surface px-4 py-3.5">
        <span
          className={cn(
            "grid size-[46px] flex-none place-items-center rounded-md text-white",
            result.format === "PDF" ? "bg-danger" : "bg-success"
          )}
        >
          <Icon className="size-[22px]" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate font-mono text-[13.5px] font-semibold">{result.filename}</div>
          <div className="mt-0.5 text-xs text-muted">
            {result.format} · {fmtBytes(result.blob.size)} · generado recién
          </div>
        </div>
        <div className="flex flex-none gap-2">
          <Button size="sm" onClick={() => triggerDownload(result.blob, result.filename)}>
            <DownloadIcon className="size-[15px]" /> Descargar
          </Button>
          <Button size="sm" variant="ghost" onClick={onClear}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  )
}
