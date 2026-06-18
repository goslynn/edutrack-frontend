import { useState } from "react"
import { BookOpenIcon, CalendarRangeIcon, UserRoundIcon } from "lucide-react"

import type {
  Evaluation,
  Grade,
  PermMap,
  RosterStudent,
  Subject,
} from "@/types/calificaciones"
import { Select } from "@/components/ui/select"
import { Tabs } from "@/components/ui/tabs"
import { EvaluacionesPanel } from "./evaluaciones-panel"
import { PromediosPanel } from "./promedios-panel"

type Flash = (variant: "success" | "info", msg: string) => void

interface CalificacionesScreenProps {
  subjects: Subject[]
  periods: string[]
  students: RosterStudent[]
  perms: PermMap
  evaluations: Evaluation[]
  grades: Grade[]
  /** Asignatura y periodo en foco (estado compartido en el layout). */
  subjectId: string
  period: string
  onSubjectChange: (id: string) => void
  onPeriodChange: (p: string) => void
  onEvalChange: (updater: (prev: Evaluation[]) => Evaluation[]) => void
  flash: Flash
  /** Navegación inyectada: abrir el libro de notas de una evaluación. */
  onOpenLibro: (evaluationId: string) => void
}

/**
 * Pantalla de «Calificaciones»: una barra de contexto (Asignatura · Periodo) que
 * fija el alcance, y dos pestañas internas —Evaluaciones (CRUD + libro de notas) y
 * Promedios (lectura derivada)— sobre el MS-Assessment. El libro de notas de cada
 * evaluación es una ruta propia (`/dashboard/calificaciones/:evaluationId`).
 */
export function CalificacionesScreen({
  subjects,
  periods,
  students,
  perms,
  evaluations,
  grades,
  subjectId,
  period,
  onSubjectChange,
  onPeriodChange,
  onEvalChange,
  flash,
  onOpenLibro,
}: CalificacionesScreenProps) {
  const [tab, setTab] = useState("evaluaciones")
  const subject = subjects.find((s) => s.id === subjectId) ?? subjects[0]

  const periodEvals = evaluations.filter((e) => e.subjectId === subjectId && e.period === period)
  const tabs = [
    { value: "evaluaciones", label: "Evaluaciones", count: periodEvals.length },
    { value: "promedios", label: "Promedios" },
  ]

  return (
    <>
      <header className="mb-[18px]">
        <h1 className="text-2xl leading-tight font-semibold tracking-tight">Calificaciones</h1>
        <p className="mt-2 max-w-[64ch] text-sm text-muted text-pretty">
          Gestiona las evaluaciones de la asignatura, registra y corrige notas, revisa el historial
          de cambios y consulta los promedios ponderados del curso.
        </p>
      </header>

      <div className="mb-[18px] flex flex-wrap items-end gap-4 rounded-xl bg-background px-4 py-3.5 ring-1 ring-foreground/10">
        <div className="flex min-w-[200px] flex-col gap-1.5">
          <label
            htmlFor="ctx-subj"
            className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold tracking-[0.05em] text-muted uppercase"
          >
            <BookOpenIcon className="size-3.5 text-primary" /> Asignatura
          </label>
          <Select
            id="ctx-subj"
            value={subjectId}
            onChange={(e) => onSubjectChange(e.target.value)}
            wrapperClassName="w-full"
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} · {s.course}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex min-w-[200px] flex-col gap-1.5">
          <label
            htmlFor="ctx-per"
            className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold tracking-[0.05em] text-muted uppercase"
          >
            <CalendarRangeIcon className="size-3.5 text-primary" /> Periodo
          </label>
          <Select
            id="ctx-per"
            value={period}
            onChange={(e) => onPeriodChange(e.target.value)}
            wrapperClassName="w-full"
          >
            {periods.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </div>
        <div className="ml-auto inline-flex items-center gap-1.5 pb-2 text-[13px] text-muted">
          <UserRoundIcon className="size-3.5" /> {subject.teacher}
        </div>
      </div>

      <div className="mb-[18px]">
        <Tabs tabs={tabs} value={tab} onValueChange={setTab} />
      </div>

      {tab === "evaluaciones" ? (
        <EvaluacionesPanel
          subject={subject}
          period={period}
          evaluations={evaluations}
          grades={grades}
          students={students}
          perms={perms}
          flash={flash}
          onEvalChange={onEvalChange}
          onOpenLibro={onOpenLibro}
        />
      ) : (
        <PromediosPanel
          subject={subject}
          period={period}
          evaluations={evaluations}
          grades={grades}
          students={students}
        />
      )}
    </>
  )
}
