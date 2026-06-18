import { useEffect, useState } from "react"

import type { Annotation, AnnotationType, RosterStudent, Teacher } from "@/types/anotaciones"
import { AnnoHistorico, type AnnoFilter } from "./anno-historico"
import { NuevaAnotacion, type AnnotationFormData } from "./nueva-anotacion"

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
  loading?: boolean
  error?: string | null
  /**
   * Registra la anotación vía API y prepende el resultado a la lista.
   * Lanza Error con el mensaje si falla. Si no se pasa: modo local (stub).
   */
  onCreateAnnotation?: (studentId: string, type: AnnotationType, content: string, date: string) => Promise<Annotation>
  /**
   * Borra la anotación vía API (DELETE). Devuelve null en éxito o msg de error.
   * Si no se pasa: solo se elimina de la lista local.
   */
  onDeleteAnnotation?: (id: string) => Promise<string | null>
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
  loading,
  error,
  onCreateAnnotation,
  onDeleteAnnotation,
}: AnotacionesScreenProps) {
  const [list, setList] = useState<Annotation[]>(annotations)
  const [filter, setFilter] = useState<AnnoFilter>("TODAS")
  const [query, setQuery] = useState("")
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Sync list when parent reloads annotations from API.
  useEffect(() => {
    setList(annotations)
  }, [annotations])

  // ── Formulario de alta ────────────────────────────────────────────────
  const onSubmit = async (data: AnnotationFormData): Promise<void> => {
    if (onCreateAnnotation) {
      // API mode: throws on error, returns Annotation on success.
      // The hook already prepends to its own list, so we don't add again here.
      await onCreateAnnotation(data.studentId, data.type, data.content, data.date)
    } else {
      // Local mode: build annotation and add to list optimistically.
      const student = roster.find((s) => s.id === data.studentId)
      setList((prev) => [
        {
          id: "new-" + Date.now(),
          studentId: data.studentId,
          student: student?.name ?? "Alumno",
          author: currentTeacher.name,
          type: data.type,
          content: data.content,
          date: data.date,
          guardianNotified: data.type === "NEGATIVE",
        },
        ...prev,
      ])
    }
  }

  // ── Borrado ───────────────────────────────────────────────────────────
  const onDelete = async (id: string): Promise<void> => {
    // Optimistic: remove from UI immediately.
    setList((prev) => prev.filter((a) => a.id !== id))
    setDeleteError(null)
    if (onDeleteAnnotation) {
      const err = await onDeleteAnnotation(id)
      if (err) setDeleteError(err)
    }
  }

  const pos = list.filter((a) => a.type === "POSITIVE").length
  const neg = list.filter((a) => a.type === "NEGATIVE").length

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-[13.5px] text-muted">
        Cargando anotaciones…
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center text-[13.5px] text-danger">
        {error}
      </div>
    )
  }

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

      {deleteError && (
        <div className="rounded-md bg-danger/10 px-3 py-2 text-[12.5px] text-danger">
          Error al eliminar: {deleteError}
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-[18px] lg:grid-cols-[1.6fr_1fr]">
        <AnnoHistorico
          list={list}
          today={today}
          filter={filter}
          onFilterChange={setFilter}
          query={query}
          onQueryChange={setQuery}
          onDelete={(id) => void onDelete(id)}
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
