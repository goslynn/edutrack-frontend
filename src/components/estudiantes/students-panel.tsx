import { useState } from "react"
import {
  ArrowRightLeftIcon,
  PencilIcon,
  SearchIcon,
  Trash2Icon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react"

import type {
  Course,
  PermMap,
  Student,
  StudentStatus,
} from "@/types/estudiantes"
import {
  RELATIONS,
  STUDENT_STATUS,
  STUDENT_TRANSITIONS,
  courseName,
} from "./estudiantes-meta"
import { cn } from "@/lib/utils"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { RowMenu, type MenuItem } from "./row-menu"
import { StudentDialog, type StudentForm } from "./student-dialog"
import { TransferDialog } from "./transfer-dialog"
import { ConfirmDialog } from "./confirm-dialog"

type Flash = (variant: "success" | "info", msg: string) => void

interface StudentsPanelProps {
  students: Student[]
  courses: Course[]
  perms: PermMap
  onChange: (updater: (prev: Student[]) => Student[]) => void
  flash: Flash
  courseFilter: string
  setCourseFilter: (id: string) => void
}

type Dialog = { mode: "create" | "edit"; initial?: Student }

/** Panel de Estudiantes: tabla buscable/filtrable + CRUD con estados RBAC. */
export function StudentsPanel({
  students,
  courses,
  perms,
  onChange,
  flash,
  courseFilter,
  setCourseFilter,
}: StudentsPanelProps) {
  const [q, setQ] = useState("")
  const [statusF, setStatusF] = useState("active")
  const [dialog, setDialog] = useState<Dialog | null>(null)
  const [transfer, setTransfer] = useState<Student | null>(null)
  const [del, setDel] = useState<Student | null>(null)

  const filtered = students.filter((s) => {
    const t = (
      s.firstName +
      " " +
      s.lastName +
      " " +
      s.rut +
      " " +
      s.guardians.map((g) => g.firstName + g.lastName).join(" ")
    ).toLowerCase()
    if (q && !t.includes(q.toLowerCase())) return false
    if (courseFilter !== "all" && s.courseId !== courseFilter) return false
    if (statusF === "active" && s.status === "DELETED") return false
    if (statusF !== "all" && statusF !== "active" && s.status !== statusF) return false
    return true
  })

  const onSubmit = (data: StudentForm) => {
    if (dialog?.mode === "edit" && dialog.initial) {
      const id = dialog.initial.id
      onChange((ss) =>
        ss.map((s) => (s.id === id ? { ...s, ...data, courseId: s.courseId } : s))
      )
      flash("success", "Cambios guardados.")
    } else {
      const ns: Student = { id: "s" + Date.now(), status: "ACTIVE", ...data }
      onChange((ss) => [ns, ...ss])
      flash("success", `${data.firstName} ${data.lastName} fue matriculado en ${courseName(courses, data.courseId)}.`)
    }
    setDialog(null)
  }
  const onTransfer = (destId: string) => {
    if (!transfer) return
    onChange((ss) =>
      ss.map((s) => (s.id === transfer.id ? { ...s, courseId: destId, status: "TRANSFERRED" } : s))
    )
    flash("success", `${transfer.firstName} fue trasladado a ${courseName(courses, destId)}.`)
    setTransfer(null)
  }
  const onDelete = () => {
    if (!del) return
    onChange((ss) => ss.map((s) => (s.id === del.id ? { ...s, status: "DELETED" } : s)))
    flash("success", `${del.firstName} ${del.lastName} fue eliminado.`)
    setDel(null)
  }

  const activos = students.filter((s) => s.status === "ACTIVE").length
  const activeCourses = courses.filter((c) => c.status === "ACTIVE")

  const rowMenu = (s: Student): MenuItem[] => {
    const canTransfer = STUDENT_TRANSITIONS[s.status].includes("TRANSFERRED")
    const canDelete = STUDENT_TRANSITIONS[s.status].includes("DELETED")
    return [
      { icon: PencilIcon, label: "Editar", state: perms["students.edit"], onClick: () => setDialog({ mode: "edit", initial: s }) },
      { icon: ArrowRightLeftIcon, label: "Trasladar de curso", state: canTransfer ? perms["students.transfer"] : "hidden", onClick: () => setTransfer(s) },
      { icon: Trash2Icon, label: "Eliminar", danger: true, state: canDelete ? perms["students.delete"] : "hidden", onClick: () => setDel(s) },
    ]
  }

  return (
    <div>
      <header className="mb-3.5 flex min-h-9 items-center justify-between gap-4">
        <p className="text-[13.5px] text-muted">
          {activos} alumnos activos · {activeCourses.length} cursos
        </p>
        {perms["students.create"] !== "hidden" && (
          <Button disabled={perms["students.create"] === "disabled"} onClick={() => setDialog({ mode: "create" })}>
            <UserPlusIcon /> Nuevo alumno
          </Button>
        )}
      </header>

      <div className="mb-3.5 flex flex-wrap gap-2.5">
        <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-muted">
          <SearchIcon className="size-4 flex-none" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre, RUT o apoderado…"
            className="w-full border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
          />
        </div>
        <Select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} aria-label="Curso" wrapperClassName="min-w-[168px]">
          <option value="all">Todos los cursos</option>
          {activeCourses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select value={statusF} onChange={(e) => setStatusF(e.target.value)} aria-label="Estado" wrapperClassName="min-w-[168px]">
          <option value="active">Activos y trasladados</option>
          <option value="ACTIVE">Solo activos</option>
          <option value="TRANSFERRED">Trasladados</option>
          <option value="DELETED">Eliminados</option>
          <option value="all">Todos</option>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl bg-background ring-1 ring-foreground/10">
        <table className="w-full border-collapse">
          <thead>
            <tr className="[&>th]:border-b [&>th]:border-border [&>th]:bg-surface [&>th]:px-4 [&>th]:py-3 [&>th]:text-left [&>th]:text-[11.5px] [&>th]:font-semibold [&>th]:tracking-[0.05em] [&>th]:text-muted [&>th]:uppercase">
              <th>Alumno</th>
              <th>Curso</th>
              <th className="hidden md:table-cell">Apoderado</th>
              <th>Estado</th>
              <th aria-label="Acciones"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => {
              const g0 = s.guardians[0]
              const extra = s.guardians.length - 1
              const st = STUDENT_STATUS[s.status as StudentStatus]
              return (
                <tr
                  key={s.id}
                  className={cn(
                    "border-b border-border text-[13.5px] last:border-b-0 hover:bg-surface/55 [&>td]:px-4 [&>td]:py-[11px] [&>td]:align-middle",
                    s.status === "DELETED" && "opacity-55"
                  )}
                >
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar name={`${s.firstName} ${s.lastName}`} size="md" />
                      <div className="min-w-0">
                        <div className="text-[13.5px] font-semibold">
                          {s.firstName} {s.lastName}
                        </div>
                        <div className="font-mono text-[12.5px] text-muted tabular-nums">{s.rut}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Badge variant="neutral">{courseName(courses, s.courseId)}</Badge>
                  </td>
                  <td className="hidden md:table-cell">
                    {g0 ? (
                      <div>
                        <div className="flex items-center gap-1.5 text-[13.5px] font-medium">
                          {g0.firstName} {g0.lastName}
                          {extra > 0 && (
                            <span className="rounded-full bg-primary-soft px-1.5 py-px text-[10.5px] font-semibold text-primary">
                              +{extra}
                            </span>
                          )}
                        </div>
                        <div className="mt-px text-xs text-muted">{RELATIONS[g0.relationType]}</div>
                      </div>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td>
                    <Badge variant={st.variant} dot>
                      {st.label}
                    </Badge>
                  </td>
                  <td className="w-12 text-right">
                    <RowMenu items={rowMenu(s)} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 p-12 text-center text-[13.5px] text-muted">
            <UsersIcon className="size-[22px] text-border" />
            <div>No hay alumnos que coincidan con el filtro.</div>
          </div>
        )}
      </div>

      {dialog && (
        <StudentDialog
          mode={dialog.mode}
          initial={dialog.initial}
          courses={courses}
          onClose={() => setDialog(null)}
          onSubmit={onSubmit}
        />
      )}
      {transfer && (
        <TransferDialog
          student={transfer}
          courses={courses}
          onClose={() => setTransfer(null)}
          onSubmit={onTransfer}
        />
      )}
      {del && (
        <ConfirmDialog
          title={`¿Eliminar a ${del.firstName} ${del.lastName}?`}
          description="El alumno se marca como eliminado (borrado lógico). Conserva su historial pero deja de aparecer en los listados activos. Esta acción es terminal."
          confirmLabel="Eliminar"
          onClose={() => setDel(null)}
          onConfirm={onDelete}
        />
      )}
    </div>
  )
}
