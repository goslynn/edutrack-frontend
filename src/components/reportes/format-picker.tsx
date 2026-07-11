import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import type { ReportFormat } from "@/types/reportes"
import { FORMAT_META, sortFormats } from "./reportes-meta"

interface FormatPickerProps {
  supported: ReportFormat[]
  value: ReportFormat | null
  onChange: (format: ReportFormat) => void
}

/** Selector de formato de salida: solo ofrece los formatos que el reporte admite. */
export function FormatPicker({ supported, value, onChange }: FormatPickerProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(168px,1fr))] gap-2.5">
      {sortFormats(supported).map((f) => {
        const meta = FORMAT_META[f]
        const Icon = meta.icon
        const on = value === f
        return (
          <button
            key={f}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(f)}
            className={cn(
              "flex items-center gap-2.5 rounded-lg border px-3.5 py-3 text-left transition-colors",
              on ? "border-primary bg-primary-soft" : "border-border bg-background hover:border-muted-foreground/40"
            )}
          >
            <span
              className={cn(
                "grid size-[34px] flex-none place-items-center rounded-md",
                on ? "bg-background text-primary" : "bg-surface text-muted"
              )}
            >
              <Icon className="size-[18px]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13.5px] font-semibold">{meta.label}</span>
              <span className="block truncate text-[11.5px] text-muted">{meta.hint}</span>
            </span>
            <span className="flex w-4 flex-none text-primary">{on && <CheckIcon className="size-4" />}</span>
          </button>
        )
      })}
    </div>
  )
}
