import { useState } from "react"
import {
  CalendarIcon,
  ClipboardListIcon,
  ClipboardPenIcon,
  PencilIcon,
  PlusIcon,
  ScaleIcon,
  SearchIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react"

import type {
  Evaluation,
  Grade,
  PermMap,
  RosterStudent,
  Subject,
} from "@/types/calificaciones"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RowMenu, type MenuItem } from "./row-menu"
import { GradeBadge } from "./grade-badge"
import { EvaluacionDialog, type EvaluationForm } from "./evaluacion-dialog"
import { ConfirmDeleteEval } from "./confirm-delete-eval"
import { fmtDate, fmtGrade, round1 } from "./calificaciones-meta"

type Flash = (variant: "success" | "info", msg: string) => void

interface EvaluacionesPanelProps {
  subject: Subject
  period: string
  evaluations: Evaluation[]
  grades: Grade[]
  students: RosterStudent[]
  perms: PermMap
  flash: Flash
  onEvalChange: (updater: (prev: Evaluation[]) => Evaluation[]) => void
  /** Navegación inyectada: abrir el libro de notas de una evaluación. */
  onOpenLibro: (evaluationId: string) => void
  onCreateEvalApi?: (data: { name: string; evaluationDate: string; weight: number }) => Promise<Evaluation | null>
  onUpdateEvalApi?: (id: string, data: { name: string; evaluationDate: string; weight: number }) => Promise<Evaluation | null>
  onDeleteEvalApi?: (id: string) => Promise<boolean>
}

type Dialog = { mode: "create" | "edit"; initial?: Evaluation }

const nowISO = () => new Date().toISOString()

/**
 * Lista de evaluaciones de la asignatura/periodo: crear, editar y eliminar (409 si
 * tiene notas), con la ponderación acumulada y un atajo al libro de notas. Cada
 * acción honra su estado RBAC.
 */
export function EvaluacionesPanel({
  subject,
  period,
  evaluations,
  grades,
  students,
  perms,
  flash,
  onEvalChange,
  onOpenLibro,
  onCreateEvalApi,
  onUpdateEvalApi,
  onDeleteEvalApi,
}: EvaluacionesPanelProps) {
  const [q, setQ] = useState("")
  const [dialog, setDialog] = useState<Dialog | null>(null)
  const [del, setDel] = useState<Evaluation | null>(null)
  const [saving, setSaving] = useState(false)

  const list = evaluations
    .filter((e) => e.subjectId === subject.id && e.period === period)
    .sort((a, b) => a.evaluationDate.localeCompare(b.evaluationDate))

  const weightUsed = list.reduce((a, e) => a + e.weight, 0)
  const filtered = list.filter((e) => !q || e.name.toLowerCase().includes(q.toLowerCase()))

  const countFor = (id: string) => grades.filter((g) => g.evaluationId === id).length
  const avgFor = (id: string) => {
    const gs = grades.filter((g) => g.evaluationId === id)
    return gs.length ? round1(gs.reduce((a, g) => a + g.score, 0) / gs.length) : null
  }
  const stateFor = (id: string): { label: string; variant: "neutral" | "primary" | "success" } => {
    const n = countFor(id)
    if (n === 0) return { label: "Sin notas", variant: "neutral" }
    if (n < students.length) return { label: "En curso", variant: "primary" }
    return { label: "Completa", variant: "success" }
  }

  const onSubmit = (data: EvaluationForm) => {
    void (async () => {
      setSaving(true)
      if (dialog?.mode === "edit" && dialog.initial) {
        const id = dialog.initial.id
        if (onUpdateEvalApi) {
          const result = await onUpdateEvalApi(id, data)
          if (result) {
            onEvalChange((es) => es.map((e) => (e.id === id ? result : e)))
            flash("success", "Evaluación actualizada.")
            setDialog(null)
          }
        } else {
          onEvalChange((es) => es.map((e) => (e.id === id ? { ...e, ...data, updatedAt: nowISO() } : e)))
          flash("success", "Evaluación actualizada.")
          setDialog(null)
        }
      } else {
        if (onCreateEvalApi) {
          const result = await onCreateEvalApi(data)
          if (result) {
            onEvalChange((es) => [...es, result])
            flash("success", `«${data.name}» fue creada.`)
            setDialog(null)
          }
        } else {
          const ne: Evaluation = {
            id: "e" + Date.now(),
            subjectId: subject.id,
            period,
            ...data,
            createdAt: nowISO(),
            updatedAt: nowISO(),
          }
          onEvalChange((es) => [...es, ne])
          flash("success", `«${data.name}» fue creada.`)
          setDialog(null)
        }
      }
      setSaving(false)
    })()
  }
  const onDelete = () => {
    if (!del) return
    const target = del
    void (async () => {
      setSaving(true)
      if (onDeleteEvalApi) {
        const ok = await onDeleteEvalApi(target.id)
        if (ok) {
          onEvalChange((es) => es.filter((e) => e.id !== target.id))
          flash("success", `«${target.name}» fue eliminada.`)
        }
      } else {
        onEvalChange((es) => es.filter((e) => e.id !== target.id))
        flash("success", `«${target.name}» fue eliminada.`)
      }
      setSaving(false)
    })()
    setDel(null)
  }

  const canCreate = perms["evaluations.create"]

  return (
    <div>
      <header className="mb-3.5 flex min-h-9 flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-[13.5px] text-muted">
            {list.length} evaluación{list.length === 1 ? "" : "es"} · {subject.name} · Periodo{" "}
            {period}
          </p>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] font-mono text-xs font-semibold tabular-nums",
              weightUsed === 100
                ? "border-success/35 bg-success-soft text-success"
                : weightUsed > 100
                  ? "border-warning/40 bg-warning-soft text-warning-strong"
                  : "border-border bg-background text-muted"
            )}
          >
            <ScaleIcon className="size-3" /> Ponderación {fmtGrade(weightUsed)}%
          </span>
        </div>
        {canCreate !== "hidden" && (
          <Button disabled={canCreate === "disabled"} onClick={() => setDialog({ mode: "create" })}>
            <PlusIcon /> Nueva evaluación
          </Button>
        )}
      </header>

      <div className="mb-3.5 flex flex-wrap gap-2.5">
        <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-muted">
          <SearchIcon className="size-4 flex-none" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar evaluación…"
            className="w-full border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-background ring-1 ring-foreground/10">
        <table className="w-full border-collapse">
          <thead>
            <tr className="[&>th]:border-b [&>th]:border-border [&>th]:bg-surface [&>th]:px-4 [&>th]:py-3 [&>th]:text-left [&>th]:text-[11.5px] [&>th]:font-semibold [&>th]:tracking-[0.05em] [&>th]:text-muted [&>th]:uppercase">
              <th>Evaluación</th>
              <th>Ponderación</th>
              <th>Notas</th>
              <th className="hidden md:table-cell">Prom. curso</th>
              <th>Estado</th>
              <th aria-label="Acciones"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => {
              const n = countFor(e.id)
              const avg = avgFor(e.id)
              const st = stateFor(e.id)
              const rowMenu: MenuItem[] = [
                {
                  icon: ClipboardPenIcon,
                  label: "Libro de notas",
                  state: "enabled",
                  onClick: () => onOpenLibro(e.id),
                },
                {
                  icon: PencilIcon,
                  label: "Editar",
                  state: perms["evaluations.edit"],
                  onClick: () => setDialog({ mode: "edit", initial: e }),
                },
                {
                  icon: Trash2Icon,
                  label: "Eliminar",
                  danger: true,
                  state: perms["evaluations.delete"],
                  onClick: () => setDel(e),
                },
              ]
              return (
                <tr
                  key={e.id}
                  className="border-b border-border text-[13.5px] last:border-b-0 hover:bg-surface/55 [&>td]:px-4 [&>td]:py-[11px] [&>td]:align-middle"
                >
                  <td>
                    <button
                      type="button"
                      onClick={() => onOpenLibro(e.id)}
                      className="group flex flex-col items-start gap-[3px] text-left outline-none"
                    >
                      <span className="text-[13.5px] font-semibold transition-colors group-hover:text-primary">
                        {e.name}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                        <CalendarIcon className="size-3" /> {fmtDate(e.evaluationDate)}
                      </span>
                    </button>
                  </td>
                  <td>
                    <span className="font-mono font-semibold tabular-nums">{fmtGrade(e.weight)}%</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => onOpenLibro(e.id)}
                      title="Abrir libro de notas"
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background py-[3px] pr-2.5 pl-2.5 font-mono text-[12.5px] font-semibold tabular-nums text-foreground transition-colors outline-none hover:border-primary hover:text-primary [&_svg]:text-muted hover:[&_svg]:text-primary"
                    >
                      <UsersIcon className="size-[13px]" /> {n}
                      <span className="font-sans font-medium text-muted">/{students.length}</span>
                    </button>
                  </td>
                  <td className="hidden md:table-cell">
                    {avg != null ? <GradeBadge score={avg} /> : <span className="text-muted">—</span>}
                  </td>
                  <td>
                    <Badge variant={st.variant} dot>
                      {st.label}
                    </Badge>
                  </td>
                  <td className="w-12 text-right">
                    <RowMenu items={rowMenu} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2.5 p-12 text-center text-[13.5px] text-muted">
            <ClipboardListIcon className="size-[22px] text-border" />
            <div>
              {list.length === 0
                ? "Aún no hay evaluaciones para esta asignatura y periodo."
                : "Ninguna evaluación coincide con la búsqueda."}
            </div>
            {list.length === 0 && canCreate !== "hidden" && (
              <Button
                size="sm"
                disabled={canCreate === "disabled"}
                onClick={() => setDialog({ mode: "create" })}
              >
                <PlusIcon /> Crear la primera
              </Button>
            )}
          </div>
        )}
      </div>

      {dialog && (
        <EvaluacionDialog
          mode={dialog.mode}
          initial={dialog.initial}
          subject={subject}
          period={period}
          weightUsed={weightUsed}
          onClose={() => setDialog(null)}
          onSubmit={onSubmit}
          saving={saving}
        />
      )}
      {del && (
        <ConfirmDeleteEval
          evaluation={del}
          gradeCount={countFor(del.id)}
          onClose={() => setDel(null)}
          onConfirm={onDelete}
        />
      )}
    </div>
  )
}
