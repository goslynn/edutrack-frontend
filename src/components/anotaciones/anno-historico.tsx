import {
  HistoryIcon,
  MessageSquareDashedIcon,
  SearchIcon,
  Trash2Icon,
  UserIcon,
} from "lucide-react"

import type { Annotation, AnnotationType } from "@/types/anotaciones"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { TYPE_META, formatAnnoDate } from "./anno-meta"

export type AnnoFilter = "TODAS" | AnnotationType

const FILTERS: { value: AnnoFilter; label: string }[] = [
  { value: "TODAS", label: "Todas" },
  { value: "POSITIVE", label: "Positivas" },
  { value: "NEGATIVE", label: "Negativas" },
]

const RAIL: Record<AnnotationType, string> = {
  POSITIVE: "bg-success",
  NEGATIVE: "bg-danger",
}

function AnnoRow({
  a,
  today,
  onDelete,
}: {
  a: Annotation
  today: string
  onDelete: (id: string) => void
}) {
  const meta = TYPE_META[a.type]
  return (
    <div className="flex gap-3 border-b border-border px-[18px] py-[15px] last:border-b-0">
      <span className={cn("w-[3px] flex-none self-stretch rounded-[3px]", RAIL[a.type])} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2.5">
          <span className="inline-flex min-w-0 items-center gap-2.5">
            <span className="truncate text-sm font-semibold">{a.student}</span>
            <Badge variant={meta.badge} dot>
              {meta.label}
            </Badge>
          </span>
          <span className="flex-none font-mono text-xs text-muted">
            {formatAnnoDate(a.date, today)}
          </span>
        </div>
        <p className="my-2 text-[13.5px] leading-normal text-pretty">{a.content}</p>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted">
            <UserIcon className="size-[13px]" /> {a.author}
          </span>
          {a.type === "NEGATIVE" && a.guardianNotified && (
            <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-info">
              <span className="size-1.5 rounded-full bg-info" aria-hidden /> Apoderado notificado
            </span>
          )}
          <button
            type="button"
            title="Eliminar anotación"
            aria-label="Eliminar anotación"
            onClick={() => onDelete(a.id)}
            className="ml-auto grid size-7 place-items-center rounded-md text-muted transition-colors outline-none hover:bg-danger-soft hover:text-danger"
          >
            <Trash2Icon className="size-[15px]" />
          </button>
        </div>
      </div>
    </div>
  )
}

interface AnnoHistoricoProps {
  list: Annotation[]
  /** Fecha de referencia (ISO) para las etiquetas relativas «Hoy» / «Ayer». */
  today: string
  filter: AnnoFilter
  onFilterChange: (f: AnnoFilter) => void
  query: string
  onQueryChange: (q: string) => void
  onDelete: (id: string) => void
}

/** Panel izquierdo: histórico de anotaciones, filtrable por tipo y por estudiante. */
export function AnnoHistorico({
  list,
  today,
  filter,
  onFilterChange,
  query,
  onQueryChange,
  onDelete,
}: AnnoHistoricoProps) {
  const filtered = list.filter((a) => {
    if (filter !== "TODAS" && a.type !== filter) return false
    const q = query.trim().toLowerCase()
    if (q && !a.student.toLowerCase().includes(q)) return false
    return true
  })

  return (
    <section className="flex min-w-0 flex-col overflow-hidden rounded-xl bg-background ring-1 ring-foreground/10">
      <div className="flex items-center justify-between gap-2.5 px-[18px] py-[15px]">
        <span className="inline-flex items-center gap-2 text-[14.5px] font-semibold">
          <HistoryIcon className="size-[17px]" /> Histórico de anotaciones
        </span>
        <Badge variant="neutral">
          {filtered.length} {filtered.length === 1 ? "registro" : "registros"}
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 border-y border-border bg-surface px-4 py-[11px]">
        <div className="inline-flex gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={filter === f.value}
              onClick={() => onFilterChange(f.value)}
              className={cn(
                "rounded-md border px-[11px] py-[5px] text-[12.5px] font-medium transition-colors outline-none",
                filter === f.value
                  ? "border-transparent bg-primary-soft text-primary"
                  : "border-border bg-background text-muted hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className="ml-auto flex min-w-[140px] max-w-[280px] flex-1 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-[5px] text-muted">
          <SearchIcon className="size-[15px] flex-none" />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Buscar estudiante…"
            className="w-full border-none bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted"
          />
        </span>
      </div>

      <div className="flex flex-col">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2.5 px-6 py-12 text-center text-[13.5px] text-muted">
            <MessageSquareDashedIcon className="size-[30px] text-border" />
            <span>
              {query.trim()
                ? "Ningún estudiante coincide con la búsqueda."
                : "No hay anotaciones de este tipo en el curso."}
            </span>
          </div>
        ) : (
          filtered.map((a) => (
            <AnnoRow key={a.id} a={a} today={today} onDelete={onDelete} />
          ))
        )}
      </div>
    </section>
  )
}
