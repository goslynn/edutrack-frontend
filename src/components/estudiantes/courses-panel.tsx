import { useState } from "react"
import {
  BookOpenIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react"

import type { Course, CourseStatus, PermMap, Student } from "@/types/estudiantes"
import { COURSE_STATUS } from "./estudiantes-meta"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { RowMenu, type MenuItem } from "./row-menu"
import { CourseDialog, type CourseForm } from "./course-dialog"
import { ConfirmDialog } from "./confirm-dialog"

type Flash = (variant: "success" | "info", msg: string) => void

interface CoursesPanelProps {
  courses: Course[]
  students: Student[]
  perms: PermMap
  onCreate: (data: CourseForm) => Promise<string | null>
  onUpdate: (id: string, data: CourseForm) => Promise<string | null>
  onDelete: (course: Course) => Promise<string | null>
  flash: Flash
  onViewStudents: (courseId: string) => void
}

type Dialog = { mode: "create" | "edit"; initial?: Course }

/** Panel de Cursos: tabla buscable/filtrable + CRUD con estados RBAC. */
export function CoursesPanel({
  courses,
  students,
  perms,
  onCreate,
  onUpdate,
  onDelete,
  flash,
  onViewStudents,
}: CoursesPanelProps) {
  const [q, setQ] = useState("")
  const [yearF, setYearF] = useState("all")
  const [statusF, setStatusF] = useState("ACTIVE")
  const [dialog, setDialog] = useState<Dialog | null>(null)
  const [del, setDel] = useState<Course | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [mutationError, setMutationError] = useState<string | null>(null)

  const countActive = (cid: string) =>
    students.filter((s) => s.courseId === cid && s.status !== "DELETED").length

  const filtered = courses.filter((c) => {
    const t = (c.name + " " + c.level + " " + c.section + " " + c.description).toLowerCase()
    if (q && !t.includes(q.toLowerCase())) return false
    if (yearF !== "all" && String(c.academicYear) !== yearF) return false
    if (statusF !== "all" && c.status !== statusF) return false
    return true
  })

  const clearMutation = () => setMutationError(null)

  const handleSubmit = async (data: CourseForm) => {
    setSubmitting(true)
    clearMutation()
    const err =
      dialog?.mode === "edit" && dialog.initial
        ? await onUpdate(dialog.initial.id, data)
        : await onCreate(data)
    setSubmitting(false)
    if (err) {
      setMutationError(err)
      return
    }
    flash("success", dialog?.mode === "edit" ? "Curso actualizado." : `${data.name} fue creado.`)
    setDialog(null)
    clearMutation()
  }

  const handleDelete = async () => {
    if (!del) return
    setSubmitting(true)
    clearMutation()
    const err = await onDelete(del)
    setSubmitting(false)
    if (err) {
      setMutationError(err)
      return
    }
    flash("success", `${del.name} fue eliminado.`)
    setDel(null)
    clearMutation()
  }

  const years = Array.from(new Set(courses.map((c) => c.academicYear))).sort((a, b) => b - a)
  const activos = courses.filter((c) => c.status === "ACTIVE").length

  const rowMenu = (c: Course): MenuItem[] => [
    { icon: UsersIcon, label: "Ver estudiantes", state: "enabled", onClick: () => onViewStudents(c.id) },
    { icon: PencilIcon, label: "Editar", state: c.status === "DELETED" ? "hidden" : perms["courses.edit"], onClick: () => { clearMutation(); setDialog({ mode: "edit", initial: c }) } },
    { icon: Trash2Icon, label: "Eliminar", danger: true, state: c.status === "DELETED" ? "hidden" : perms["courses.delete"], onClick: () => { clearMutation(); setDel(c) } },
  ]

  return (
    <div>
      <header className="mb-3.5 flex min-h-9 items-center justify-between gap-4">
        <p className="text-[13.5px] text-muted">
          {activos} cursos activos · {students.filter((s) => s.status !== "DELETED").length} alumnos matriculados
        </p>
        {perms["courses.create"] !== "hidden" && (
          <Button disabled={perms["courses.create"] === "disabled"} onClick={() => { clearMutation(); setDialog({ mode: "create" }) }}>
            <PlusIcon /> Nuevo curso
          </Button>
        )}
      </header>

      <div className="mb-3.5 flex flex-wrap gap-2.5">
        <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-muted">
          <SearchIcon className="size-4 flex-none" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre o nivel…"
            className="w-full border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
          />
        </div>
        <Select value={yearF} onChange={(e) => setYearF(e.target.value)} aria-label="Año" wrapperClassName="min-w-[168px]">
          <option value="all">Todos los años</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </Select>
        <Select value={statusF} onChange={(e) => setStatusF(e.target.value)} aria-label="Estado" wrapperClassName="min-w-[168px]">
          <option value="ACTIVE">Activos</option>
          <option value="DELETED">Eliminados</option>
          <option value="all">Todos</option>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl bg-background ring-1 ring-foreground/10">
        <table className="w-full border-collapse">
          <thead>
            <tr className="[&>th]:border-b [&>th]:border-border [&>th]:bg-surface [&>th]:px-4 [&>th]:py-3 [&>th]:text-left [&>th]:text-[11.5px] [&>th]:font-semibold [&>th]:tracking-[0.05em] [&>th]:text-muted [&>th]:uppercase">
              <th>Curso</th>
              <th className="hidden md:table-cell">Año</th>
              <th>Alumnos</th>
              <th>Estado</th>
              <th aria-label="Acciones"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const st = COURSE_STATUS[c.status as CourseStatus]
              const n = countActive(c.id)
              return (
                <tr
                  key={c.id}
                  className={cn(
                    "border-b border-border text-[13.5px] last:border-b-0 hover:bg-surface/55 [&>td]:px-4 [&>td]:py-[11px] [&>td]:align-middle",
                    c.status === "DELETED" && "opacity-55"
                  )}
                >
                  <td>
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className="grid size-[38px] flex-none place-items-center rounded-[10px] bg-primary-soft text-[15px] font-bold text-primary"
                      >
                        {c.section || "—"}
                      </span>
                      <div className="min-w-0">
                        <div className="text-[13.5px] font-semibold">{c.name}</div>
                        <div className="mt-px max-w-[42ch] truncate text-xs text-muted">
                          {c.description || c.level}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden md:table-cell">
                    <span className="font-mono text-muted tabular-nums">{c.academicYear}</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      disabled={n === 0}
                      onClick={() => n > 0 && onViewStudents(c.id)}
                      title={n > 0 ? "Ver estudiantes" : "Sin alumnos"}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background py-[3px] pr-[11px] pl-[9px] text-[12.5px] font-semibold text-foreground transition-colors outline-none hover:not-disabled:border-primary hover:not-disabled:text-primary disabled:opacity-50 [&_svg]:size-[13px] [&_svg]:text-muted hover:not-disabled:[&_svg]:text-primary"
                    >
                      <UsersIcon /> {n}
                    </button>
                  </td>
                  <td>
                    <Badge variant={st.variant} dot>
                      {st.label}
                    </Badge>
                  </td>
                  <td className="w-12 text-right">
                    <RowMenu items={rowMenu(c)} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 p-12 text-center text-[13.5px] text-muted">
            <BookOpenIcon className="size-[22px] text-border" />
            <div>No hay cursos que coincidan con el filtro.</div>
          </div>
        )}
      </div>

      {dialog && (
        <CourseDialog
          mode={dialog.mode}
          initial={dialog.initial}
          onClose={() => { setDialog(null); clearMutation() }}
          onSubmit={handleSubmit}
          loading={submitting}
          error={mutationError}
        />
      )}
      {del && (
        <ConfirmDialog
          title={`¿Eliminar el curso ${del.name}?`}
          description={
            countActive(del.id) > 0
              ? `Este curso tiene ${countActive(del.id)} alumno${countActive(del.id) === 1 ? "" : "s"} activo${countActive(del.id) === 1 ? "" : "s"}. Traslada a los alumnos antes de eliminarlo para no perder su matrícula.`
              : "El curso se marca como eliminado (borrado lógico). Deja de aparecer en los listados activos pero su historial se preserva."
          }
          confirmLabel="Eliminar curso"
          disabled={countActive(del.id) > 0}
          onClose={() => { setDel(null); clearMutation() }}
          onConfirm={handleDelete}
          loading={submitting}
          error={mutationError}
        />
      )}
    </div>
  )
}
