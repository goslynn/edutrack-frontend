import { useState } from "react"

import type { Annotation, RosterStudent, Teacher } from "@/types/anotaciones"
import { AnnoHistorico, type AnnoFilter } from "./anno-historico"
import { NuevaAnotacion } from "./nueva-anotacion"

interface AnotacionesScreenProps {
  /** Curso en contexto (del selector del topbar). */
  courseName: string
  /** Histórico semilla (en producción, del Annotation service). */
  annotations: Annotation[]
  /** Nómina del curso para el selector del formulario. */
  roster: RosterStudent[]
  /** Fecha de referencia (ISO) para el formulario y las etiquetas relativas. */
  today: string
  /** Docente autenticado que firma las anotaciones nuevas. */
  currentTeacher: Teacher
}

/**
 * Contenedor de Anotaciones (registro de convivencia escolar): histórico
 * filtrable + formulario de alta. El alta y el borrado solo mutan estado local
 * de UI; en producción invocan el Annotation service vía un hook contenedor (la
 * capa visual nunca llama HTTP). El borrado es lógico (sella `deletedAt`).
 */
export function AnotacionesScreen({
  courseName,
  annotations,
  roster,
  today,
  currentTeacher,
}: AnotacionesScreenProps) {
  const [list, setList] = useState<Annotation[]>(annotations)
  const [filter, setFilter] = useState<AnnoFilter>("TODAS")
  const [query, setQuery] = useState("")

  const onSubmit = (a: Annotation) => setList((prev) => [a, ...prev])
  const onDelete = (id: string) => setList((prev) => prev.filter((a) => a.id !== id))

  const pos = list.filter((a) => a.type === "POSITIVE").length
  const neg = list.filter((a) => a.type === "NEGATIVE").length

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-5 px-8 pt-[26px] pb-11">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-[7px] text-[11.5px] font-semibold tracking-[0.06em] text-muted uppercase">
            Anotaciones
          </div>
          <h1 className="text-2xl leading-tight font-semibold tracking-tight">
            {courseName}
          </h1>
          <p className="mt-[7px] text-sm text-muted">
            Registro de convivencia escolar · Semestre 1
          </p>
        </div>
        <div className="hidden items-end gap-[22px] sm:flex">
          <Metric value={list.length} label="Vigentes" />
          <Metric value={pos} label="Positivas" tone="success" />
          <Metric value={neg} label="Negativas" tone="danger" />
        </div>
      </header>

      <div className="grid grid-cols-1 items-start gap-[18px] lg:grid-cols-[1.6fr_1fr]">
        <AnnoHistorico
          list={list}
          today={today}
          filter={filter}
          onFilterChange={setFilter}
          query={query}
          onQueryChange={setQuery}
          onDelete={onDelete}
        />
        <NuevaAnotacion
          roster={roster}
          today={today}
          currentTeacher={currentTeacher}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  )
}

function Metric({
  value,
  label,
  tone,
}: {
  value: number
  label: string
  tone?: "success" | "danger"
}) {
  return (
    <div className="flex flex-col items-end gap-0.5">
      <span
        className={
          "text-[22px] leading-none font-semibold tabular-nums" +
          (tone === "success" ? " text-success" : tone === "danger" ? " text-danger" : "")
        }
      >
        {value}
      </span>
      <span className="text-[11.5px] font-semibold tracking-[0.05em] text-muted uppercase">
        {label}
      </span>
    </div>
  )
}
