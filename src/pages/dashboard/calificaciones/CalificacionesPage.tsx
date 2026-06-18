import { Outlet, useOutletContext } from "react-router-dom"

import type {
  AuditByGrade,
  Evaluation,
  Grade,
  PermMap,
  RosterStudent,
  Subject,
} from "@/types/calificaciones"
import { Alert } from "@/components/ui/alert"
import type { DashboardOutletContext } from "@/components/dashboard/dashboard-layout"
import { useCalificaciones } from "@/hooks/useCalificaciones"

type Flash = (variant: "success" | "info", msg: string) => void

/**
 * Estado compartido entre el cascarón de Calificaciones y sus rutas hijas (índice
 * y libro de notas). Viaja por el `context` del `<Outlet>` — no por props
 * perforadas ni estado global.
 */
export interface CalificacionesOutletContext {
  subjects: Subject[]
  periods: string[]
  students: RosterStudent[]
  perms: PermMap
  users: Record<string, string>
  evaluations: Evaluation[]
  grades: Grade[]
  audit: AuditByGrade
  subjectId: string
  period: string
  setSubjectId: (id: string) => void
  setPeriod: (p: string) => void
  onEvalChange: (updater: (prev: Evaluation[]) => Evaluation[]) => void
  onRegister: (evaluationId: string, studentId: string, score: number) => void
  onCorrect: (gradeId: string, score: number) => void
  loadAudit: (gradeId: string) => void
  onCreateEvalApi: (data: { name: string; evaluationDate: string; weight: number }) => Promise<Evaluation | null>
  onUpdateEvalApi: (id: string, data: { name: string; evaluationDate: string; weight: number }) => Promise<Evaluation | null>
  onDeleteEvalApi: (id: string) => Promise<boolean>
  flash: Flash
  loading: boolean
  error: string | null
}

/**
 * Cascarón de «Calificaciones» (`/dashboard/calificaciones`). Container: orquesta
 * el hook `useCalificaciones` con el `courseId` real del contexto del layout y
 * comparte el estado mutable de la sección con sus rutas hijas vía `<Outlet context>`.
 * El toast vive aquí para sobrevivir a la navegación índice ↔ libro de notas.
 */
export function CalificacionesPage() {
  const { courseId } = useOutletContext<DashboardOutletContext>()
  const hook = useCalificaciones(courseId)

  const ctx: CalificacionesOutletContext = {
    subjects: hook.subjects,
    periods: hook.periods,
    students: hook.students,
    perms: hook.perms,
    users: hook.users,
    evaluations: hook.evaluations,
    grades: hook.grades,
    audit: hook.audit,
    subjectId: hook.subjectId,
    period: hook.period,
    setSubjectId: hook.setSubjectId,
    setPeriod: hook.setPeriod,
    onEvalChange: hook.onEvalChange,
    onRegister: hook.onRegister,
    onCorrect: hook.onCorrect,
    loadAudit: hook.loadAudit,
    onCreateEvalApi: hook.onCreateEvalApi,
    onUpdateEvalApi: hook.onUpdateEvalApi,
    onDeleteEvalApi: hook.onDeleteEvalApi,
    flash: hook.flash,
    loading: hook.loading,
    error: hook.error,
  }

  return (
    <div className="mx-auto max-w-[1120px] px-8 pt-[26px] pb-[72px]">
      {hook.toast && (
        <div className="mb-3.5" key={hook.toast.k}>
          <Alert variant={hook.toast.variant}>{hook.toast.msg}</Alert>
        </div>
      )}
      <Outlet context={ctx} />
    </div>
  )
}
