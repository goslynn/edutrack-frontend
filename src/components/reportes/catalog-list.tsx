import { useMemo, useState } from "react"
import { LockIcon, SearchIcon, SearchXIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import type { ReportDefinitionSummary } from "@/types/reportes"
import { domainMeta, domainMetaFor, domainOf, FORMAT_META, sortFormats } from "./reportes-meta"

interface CatalogListProps {
  definitions: ReportDefinitionSummary[]
  selectedId: string | null
  onSelect: (id: string) => void
}

/** Catálogo buscable/filtrable de reportes disponibles (panel izquierdo de Emisión). */
export function CatalogList({ definitions, selectedId, onSelect }: CatalogListProps) {
  const [query, setQuery] = useState("")
  const [domainFilter, setDomainFilter] = useState("todos")

  const domains = useMemo(() => {
    const seen = new Set<string>()
    for (const d of definitions) seen.add(domainOf(d.reportKey))
    return [...seen]
  }, [definitions])

  const filtered = definitions.filter((d) => {
    if (domainFilter !== "todos" && domainOf(d.reportKey) !== domainFilter) return false
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return (
      d.name.toLowerCase().includes(q) ||
      d.reportKey.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q)
    )
  })

  const chip = (active: boolean) =>
    cn(
      "rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors",
      active
        ? "border-transparent bg-primary-soft text-primary"
        : "border-border bg-background text-muted hover:text-foreground"
    )

  return (
    <aside className="flex max-h-[calc(100vh-96px)] flex-col rounded-xl bg-background ring-1 ring-foreground/10 lg:sticky lg:top-5">
      <div className="flex items-center gap-2 border-b border-border px-3.5 py-3 text-muted">
        <SearchIcon className="size-4 flex-none" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar reporte…"
          className="w-full border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
        />
      </div>

      <div className="flex flex-wrap gap-1.5 px-3.5 pt-3 pb-1.5">
        <button className={chip(domainFilter === "todos")} onClick={() => setDomainFilter("todos")}>
          Todos
        </button>
        {domains.map((d) => (
          <button key={d} className={chip(domainFilter === d)} onClick={() => setDomainFilter(d)}>
            {domainMetaFor(d).label}
          </button>
        ))}
      </div>

      <div className="flex flex-1 flex-col gap-0.5 overflow-auto p-1.5">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-10 text-center text-[13px] text-muted">
            <SearchXIcon className="size-[22px] text-border" />
            <span>Sin reportes que coincidan.</span>
          </div>
        ) : (
          filtered.map((d) => (
            <CatalogRow key={d.id} def={d} active={d.id === selectedId} onSelect={onSelect} />
          ))
        )}
      </div>

      <div className="border-t border-border px-3.5 py-2.5 text-xs text-muted">
        {definitions.length} reportes en el sistema · {definitions.filter((d) => d.enabled).length} habilitados
      </div>
    </aside>
  )
}

function CatalogRow({
  def,
  active,
  onSelect,
}: {
  def: ReportDefinitionSummary
  active: boolean
  onSelect: (id: string) => void
}) {
  const domain = domainMeta(def.reportKey)
  const Icon = domain.icon
  return (
    <button
      type="button"
      onClick={() => onSelect(def.id)}
      className={cn(
        "grid grid-cols-[34px_minmax(0,1fr)] gap-x-2.5 gap-y-0.5 rounded-md px-2.5 py-2.5 text-left transition-colors hover:bg-surface",
        active && "bg-primary-soft",
        !def.enabled && "opacity-60"
      )}
    >
      <span
        className={cn(
          "row-span-2 grid size-[34px] place-items-center rounded-md bg-surface text-foreground",
          active && "bg-background text-primary shadow-xs"
        )}
      >
        <Icon className="size-[18px]" />
      </span>
      <span className="min-w-0">
        <span className={cn("block truncate text-[13.5px] font-semibold -tracking-[0.01em]", active && "text-primary")}>
          {def.name}
        </span>
        <span className="block truncate font-mono text-[11px] text-muted">{def.reportKey}</span>
      </span>
      <span className="col-start-2 flex flex-wrap gap-1">
        {sortFormats(def.supportedFormats).map((f) => (
          <span
            key={f}
            className="rounded-sm border border-border bg-surface px-1.5 py-px font-mono text-[10px] font-semibold text-muted"
          >
            {FORMAT_META[f].label}
          </span>
        ))}
      </span>
      {!def.enabled && (
        <span className="col-start-2 mt-1 inline-flex w-fit items-center gap-1 text-[11px] font-semibold text-muted">
          <LockIcon className="size-3" /> No disponible
        </span>
      )}
    </button>
  )
}
