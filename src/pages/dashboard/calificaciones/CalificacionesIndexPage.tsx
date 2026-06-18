import { useNavigate, useOutletContext } from "react-router-dom"

import { CalificacionesScreen } from "@/components/calificaciones/calificaciones-screen"
import type { CalificacionesOutletContext } from "./CalificacionesPage"

/**
 * Índice de Calificaciones (`/dashboard/calificaciones`): barra de contexto +
 * pestañas Evaluaciones/Promedios. Cablea la navegación al libro de notas de cada
 * evaluación (ruta propia) y consume el estado compartido del cascarón.
 */
export function CalificacionesIndexPage() {
  const navigate = useNavigate()
  const ctx = useOutletContext<CalificacionesOutletContext>()

  if (ctx.loading) {
    return (
      <div className="flex h-64 items-center justify-center text-[13.5px] text-muted">
        Cargando calificaciones…
      </div>
    )
  }

  if (ctx.error) {
    return (
      <div className="flex h-64 items-center justify-center text-[13.5px] text-danger">
        {ctx.error}
      </div>
    )
  }

  return (
    <CalificacionesScreen
      subjects={ctx.subjects}
      periods={ctx.periods}
      students={ctx.students}
      perms={ctx.perms}
      evaluations={ctx.evaluations}
      grades={ctx.grades}
      subjectId={ctx.subjectId}
      period={ctx.period}
      onSubjectChange={ctx.setSubjectId}
      onPeriodChange={ctx.setPeriod}
      onEvalChange={ctx.onEvalChange}
      flash={ctx.flash}
      onOpenLibro={(id) => navigate(`/dashboard/calificaciones/${id}`)}
      onCreateEvalApi={ctx.onCreateEvalApi}
      onUpdateEvalApi={ctx.onUpdateEvalApi}
      onDeleteEvalApi={ctx.onDeleteEvalApi}
    />
  )
}
