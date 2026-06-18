import { useState } from "react"
import {
  ArrowLeftIcon,
  CalendarIcon,
  GraduationCapIcon,
  HistoryIcon,
  PencilIcon,
  PlusIcon,
  ScaleIcon,
  SearchIcon,
} from "lucide-react"

import type {
  AuditByGrade,
  Evaluation,
  Grade,
  PermMap,
  RosterStudent,
  Subject,
} from "@/types/calificaciones"
import { cn } from "@/lib/utils"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs } from "@/components/ui/tabs"
import { RowMenu, type MenuItem } from "./row-menu"
import { GradeBadge } from "./grade-badge"
import { GradeDialog } from "./grade-dialog"
import { HistoryModal } from "./history-modal"
import { PASS_MARK, fmtDate, fmtGrade, round1, studentName } from "./calificaciones-meta"

interface LibroNotasProps {
  evaluation: Evaluation
  subject: Subject
  students: RosterStudent[]
  grades: Grade[]
  audit: AuditByGrade
  perms: PermMap
  users: Record<string, string>
  /** Navegación inyectada: volver a la lista de evaluaciones. */
  onBack: () => void
  onRegister: (evaluationId: string, studentId: string, score: number) => void
  onCorrect: (gradeId: string, score: number) => void
}

type Dialog = { mode: "register" | "correct"; student: RosterStudent; current?: number }

const FILTERS = [
  { value: "all", label: "Todos" },
  { value: "with", label: "Con nota" },
  { value: "without", label: "Sin nota" },
]

/**
 * Libro de notas de una evaluación: roster del curso con su nota, registrar (POST)
 * y corregir (PUT, queda en auditoría) según RBAC, búsqueda y filtros con/sin nota,
 * y estadísticas de cobertura, promedio y aprobación del curso.
 */
export function LibroNotas({
  evaluation,
  subject,
  students,
  grades,
  audit,
  perms,
  users,
  onBack,
  onRegister,
  onCorrect,
}: LibroNotasProps) {
  const [q, setQ] = useState("")
  const [filter, setFilter] = useState("all")
  const [dialog, setDialog] = useState<Dialog | null>(null)
  const [history, setHistory] = useState<{ student: RosterStudent } | null>(null)

  const gradeOf = (sid: string) =>
    grades.find((g) => g.evaluationId === evaluation.id && g.studentId === sid)

  const rows = students.filter((s) => {
    const t = (studentName(s) + " " + s.rut).toLowerCase()
    if (q && !t.includes(q.toLowerCase())) return false
    const has = !!gradeOf(s.id)
    if (filter === "with" && !has) return false
    if (filter === "without" && has) return false
    return true
  })

  const registered = students.filter((s) => gradeOf(s.id))
  const courseAvg = registered.length
    ? round1(registered.reduce((a, s) => a + gradeOf(s.id)!.score, 0) / registered.length)
    : null
  const passing = registered.filter((s) => gradeOf(s.id)!.score >= PASS_MARK).length

  const submitGrade = (score: number) => {
    if (!dialog) return
    if (dialog.mode === "register") onRegister(evaluation.id, dialog.student.id, score)
    else {
      const g = gradeOf(dialog.student.id)
      if (g) onCorrect(g.id, score)
    }
    setDialog(null)
  }

  const historyGrade = history ? gradeOf(history.student.id) : undefined
  const historyEntries = historyGrade ? audit[historyGrade.id] : []

  return (
    <div className="min-w-0">
      <button
        type="button"
        onClick={onBack}
        className="mb-3 inline-flex items-center gap-1.5 py-1 text-[13px] font-semibold text-muted transition-colors outline-none hover:text-primary"
      >
        <ArrowLeftIcon className="size-4" /> Volver a evaluaciones
      </button>

      <div className="mb-4 flex flex-wrap items-start justify-between gap-5 rounded-xl bg-background px-5 py-[18px] ring-1 ring-foreground/10">
        <div>
          <div className="mb-1.5 text-[11.5px] font-semibold tracking-[0.05em] text-muted uppercase">
            {subject.name} · {subject.course} · Periodo {evaluation.period}
          </div>
          <h2 className="text-xl leading-[1.15] font-semibold -tracking-[0.01em]">
            {evaluation.name}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-[13px] text-muted">
            <span className="inline-flex items-center gap-1.5">
              <CalendarIcon className="size-3.5" /> {fmtDate(evaluation.evaluationDate)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ScaleIcon className="size-3.5" /> Ponderación {fmtGrade(evaluation.weight)}%
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Stat value={`${registered.length}`} suffix={`/${students.length}`} label="Notas" />
          <Stat value={courseAvg != null ? fmtGrade(courseAvg) : "—"} label="Prom. curso" />
          <Stat
            value={registered.length ? Math.round((passing / registered.length) * 100) + "%" : "—"}
            label="Aprobación"
          />
        </div>
      </div>

      <div className="mb-3.5 flex flex-wrap items-center gap-2.5">
        <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-muted">
          <SearchIcon className="size-4 flex-none" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar alumno por nombre o RUT…"
            className="w-full border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
          />
        </div>
        <Tabs tabs={FILTERS} value={filter} onValueChange={setFilter} />
      </div>

      <div className="overflow-hidden rounded-xl bg-background ring-1 ring-foreground/10">
        <table className="w-full border-collapse">
          <thead>
            <tr className="[&>th]:border-b [&>th]:border-border [&>th]:bg-surface [&>th]:px-4 [&>th]:py-3 [&>th]:text-left [&>th]:text-[11.5px] [&>th]:font-semibold [&>th]:tracking-[0.05em] [&>th]:text-muted [&>th]:uppercase">
              <th>Alumno</th>
              <th>Nota</th>
              <th className="hidden md:table-cell">Registrada</th>
              <th aria-label="Acciones"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => {
              const g = gradeOf(s.id)
              const rowMenu: MenuItem[] = [
                {
                  icon: PencilIcon,
                  label: "Corregir nota",
                  state: perms["grades.write"],
                  onClick: () => setDialog({ mode: "correct", student: s, current: g?.score }),
                },
                {
                  icon: HistoryIcon,
                  label: "Ver historial",
                  state: perms["audit.read"],
                  onClick: () => setHistory({ student: s }),
                },
              ]
              return (
                <tr
                  key={s.id}
                  className={cn(
                    "border-b border-border text-[13.5px] last:border-b-0 hover:bg-surface/55 [&>td]:px-4 [&>td]:py-[11px] [&>td]:align-middle",
                    !g && "bg-surface/40"
                  )}
                >
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar name={studentName(s)} size="md" />
                      <div className="min-w-0">
                        <div className="text-[13.5px] font-semibold">{studentName(s)}</div>
                        <div className="font-mono text-[12.5px] text-muted tabular-nums">{s.rut}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <GradeBadge score={g ? g.score : null} />
                  </td>
                  <td className="hidden font-mono text-muted tabular-nums md:table-cell">
                    {g ? fmtDate(g.updatedAt || g.createdAt) : <span className="text-muted">Sin nota</span>}
                  </td>
                  <td className="w-14 text-right">
                    {g ? (
                      <RowMenu items={rowMenu} />
                    ) : perms["grades.write"] !== "hidden" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={perms["grades.write"] === "disabled"}
                        onClick={() => setDialog({ mode: "register", student: s })}
                      >
                        <PlusIcon /> Registrar
                      </Button>
                    ) : null}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="flex flex-col items-center gap-2.5 p-12 text-center text-[13.5px] text-muted">
            <GraduationCapIcon className="size-[22px] text-border" />
            <div>No hay alumnos que coincidan con el filtro.</div>
          </div>
        )}
      </div>

      {dialog && (
        <GradeDialog
          mode={dialog.mode}
          student={dialog.student}
          evaluation={evaluation}
          current={dialog.current}
          onClose={() => setDialog(null)}
          onSubmit={submitGrade}
        />
      )}
      {history && (
        <HistoryModal
          student={history.student}
          evaluation={evaluation}
          entries={historyEntries}
          users={users}
          onClose={() => setHistory(null)}
        />
      )}
    </div>
  )
}

function Stat({ value, suffix, label }: { value: string; suffix?: string; label: string }) {
  return (
    <div className="min-w-[84px] rounded-lg bg-surface px-3.5 py-2.5 text-center">
      <div className="font-mono text-xl font-bold tabular-nums">
        {value}
        {suffix && <span className="text-[13px] font-medium text-muted">{suffix}</span>}
      </div>
      <div className="mt-[3px] text-[11px] tracking-[0.04em] text-muted uppercase">{label}</div>
    </div>
  )
}
