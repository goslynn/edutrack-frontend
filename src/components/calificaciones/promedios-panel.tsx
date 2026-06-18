import { useState } from "react"
import { CalculatorIcon, FunctionSquareIcon, SearchIcon } from "lucide-react"

import type { Evaluation, Grade, RosterStudent, Subject } from "@/types/calificaciones"
import { Avatar } from "@/components/ui/avatar"
import { Tabs } from "@/components/ui/tabs"
import { GradeBadge } from "./grade-badge"
import { PASS_MARK, fmtGrade, round1, studentName, weightedAverage } from "./calificaciones-meta"

interface PromediosPanelProps {
  subject: Subject
  period: string
  evaluations: Evaluation[]
  grades: Grade[]
  students: RosterStudent[]
}

const ORDERS = [
  { value: "name", label: "Alfabético" },
  { value: "avg-desc", label: "Mejor promedio" },
  { value: "avg-asc", label: "Menor promedio" },
]

/**
 * Promedio ponderado por alumno (lectura derivada de las notas, BE-ASS-002):
 * `Σ(nota×ponderación)/Σ(ponderación)`, escala chilena a 1 decimal. Considera solo
 * las notas registradas.
 */
export function PromediosPanel({
  subject,
  period,
  evaluations,
  grades,
  students,
}: PromediosPanelProps) {
  const [q, setQ] = useState("")
  const [order, setOrder] = useState("name")

  const periodEvals = evaluations.filter((e) => e.subjectId === subject.id && e.period === period)

  const rows = students.map((s) => {
    const res = weightedAverage(s.id, subject.id, period, grades, evaluations)
    return { student: s, average: res?.average ?? null, gradeCount: res?.gradeCount ?? 0 }
  })

  const withAvg = rows.filter((r) => r.average != null)
  const courseAvg = withAvg.length
    ? round1(withAvg.reduce((a, r) => a + (r.average ?? 0), 0) / withAvg.length)
    : null
  const passing = withAvg.filter((r) => (r.average ?? 0) >= PASS_MARK).length

  const view = rows
    .filter((r) => {
      const t = (studentName(r.student) + " " + r.student.rut).toLowerCase()
      return !q || t.includes(q.toLowerCase())
    })
    .sort((a, b) => {
      if (order === "name") return studentName(a.student).localeCompare(studentName(b.student))
      const av = a.average ?? -1
      const bv = b.average ?? -1
      return order === "avg-desc" ? bv - av : av - bv
    })

  return (
    <div>
      <header className="mb-3.5 flex min-h-9 flex-wrap items-center justify-between gap-4">
        <p className="text-[13.5px] text-muted">
          Promedio ponderado · {subject.name} · Periodo {period}
        </p>
        <div className="inline-flex items-center gap-4 rounded-lg bg-background px-4 py-2 ring-1 ring-foreground/10">
          <div className="flex flex-col items-center">
            <span className="font-mono text-[19px] font-bold tabular-nums">
              {courseAvg != null ? fmtGrade(courseAvg) : "—"}
            </span>
            <span className="text-[11px] tracking-[0.04em] text-muted uppercase">
              Promedio del curso
            </span>
          </div>
          <div className="h-8 w-px self-stretch bg-border" />
          <div className="flex flex-col items-center">
            <span className="font-mono text-[19px] font-bold tabular-nums">
              {withAvg.length ? Math.round((passing / withAvg.length) * 100) + "%" : "—"}
            </span>
            <span className="text-[11px] tracking-[0.04em] text-muted uppercase">Aprobación</span>
          </div>
        </div>
      </header>

      <div className="mb-3.5 flex items-start gap-2.5 rounded-lg bg-primary-soft px-4 py-3 text-[13px] leading-normal text-foreground text-pretty">
        <FunctionSquareIcon className="mt-px size-4 flex-none text-primary" />
        <span>
          Promedio ponderado ={" "}
          <span className="font-mono font-semibold text-primary">
            Σ(nota × ponderación) / Σ(ponderación)
          </span>
          . Considera solo las notas registradas; redondeado a 1 decimal.
        </span>
      </div>

      <div className="mb-3.5 flex flex-wrap items-center gap-2.5">
        <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-muted">
          <SearchIcon className="size-4 flex-none" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar alumno…"
            className="w-full border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
          />
        </div>
        <Tabs tabs={ORDERS} value={order} onValueChange={setOrder} />
      </div>

      <div className="overflow-hidden rounded-xl bg-background ring-1 ring-foreground/10">
        <table className="w-full border-collapse">
          <thead>
            <tr className="[&>th]:border-b [&>th]:border-border [&>th]:bg-surface [&>th]:px-4 [&>th]:py-3 [&>th]:text-left [&>th]:text-[11.5px] [&>th]:font-semibold [&>th]:tracking-[0.05em] [&>th]:text-muted [&>th]:uppercase">
              <th>Alumno</th>
              <th>Notas consideradas</th>
              <th className="hidden md:table-cell">Cobertura</th>
              <th>Promedio ponderado</th>
            </tr>
          </thead>
          <tbody>
            {view.map((r) => (
              <tr
                key={r.student.id}
                className="border-b border-border text-[13.5px] last:border-b-0 hover:bg-surface/55 [&>td]:px-4 [&>td]:py-[11px] [&>td]:align-middle"
              >
                <td>
                  <div className="flex items-center gap-3">
                    <Avatar name={studentName(r.student)} size="md" />
                    <div className="min-w-0">
                      <div className="text-[13.5px] font-semibold">{studentName(r.student)}</div>
                      <div className="font-mono text-[12.5px] text-muted tabular-nums">
                        {r.student.rut}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="font-mono tabular-nums">{r.gradeCount}</span>{" "}
                  <span className="text-muted">de {periodEvals.length}</span>
                </td>
                <td className="hidden md:table-cell">
                  <div className="h-1.5 max-w-[130px] overflow-hidden rounded-full bg-surface">
                    <div
                      className="h-full rounded-full bg-primary transition-[width]"
                      style={{
                        width:
                          (periodEvals.length ? (r.gradeCount / periodEvals.length) * 100 : 0) + "%",
                      }}
                    />
                  </div>
                </td>
                <td>
                  {r.average != null ? (
                    <GradeBadge score={r.average} />
                  ) : (
                    <span className="text-muted">Sin notas</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {view.length === 0 && (
          <div className="flex flex-col items-center gap-2.5 p-12 text-center text-[13.5px] text-muted">
            <CalculatorIcon className="size-[22px] text-border" />
            <div>No hay alumnos que coincidan con el filtro.</div>
          </div>
        )}
      </div>
    </div>
  )
}
