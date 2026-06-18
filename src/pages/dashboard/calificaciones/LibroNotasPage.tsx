import { Navigate, useNavigate, useOutletContext, useParams } from "react-router-dom"

import { LibroNotas } from "@/components/calificaciones/libro-notas"
import type { CalificacionesOutletContext } from "./CalificacionesPage"

/**
 * Libro de notas de una evaluación (`/dashboard/calificaciones/:evaluationId`):
 * ruta propia del detalle (recargable y compartible). Resuelve la evaluación y su
 * asignatura desde el estado compartido del cascarón; si no existe, vuelve al índice.
 */
export function LibroNotasPage() {
  const navigate = useNavigate()
  const { evaluationId } = useParams()
  const ctx = useOutletContext<CalificacionesOutletContext>()

  const evaluation = ctx.evaluations.find((e) => e.id === evaluationId)
  if (!evaluation) return <Navigate to="/dashboard/calificaciones" replace />

  const subject =
    ctx.subjects.find((s) => s.id === evaluation.subjectId) ?? ctx.subjects[0]

  if (!subject) return <Navigate to="/dashboard/calificaciones" replace />

  return (
    <LibroNotas
      evaluation={evaluation}
      subject={subject}
      students={ctx.students}
      grades={ctx.grades}
      audit={ctx.audit}
      perms={ctx.perms}
      users={ctx.users}
      onBack={() => navigate("/dashboard/calificaciones")}
      onRegister={ctx.onRegister}
      onCorrect={ctx.onCorrect}
      onLoadAudit={ctx.loadAudit}
    />
  )
}
