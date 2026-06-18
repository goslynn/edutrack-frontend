import { useRef, useState } from "react"

import type { Course, PermMap, Student } from "@/types/estudiantes"
import type { StudentForm } from "./student-dialog"
import type { CourseForm } from "./course-dialog"
import { Alert } from "@/components/ui/alert"
import { Tabs } from "@/components/ui/tabs"
import { StudentsPanel } from "./students-panel"
import { CoursesPanel } from "./courses-panel"

type Toast = { variant: "success" | "info"; msg: string; k: number } | null

export interface StudentMutations {
  create: (data: StudentForm) => Promise<string | null>
  update: (id: string, data: StudentForm) => Promise<string | null>
  transfer: (studentId: string, destCourseId: string) => Promise<string | null>
  delete: (student: Student) => Promise<string | null>
}

export interface CourseMutations {
  create: (data: CourseForm) => Promise<string | null>
  update: (id: string, data: CourseForm) => Promise<string | null>
  delete: (course: Course) => Promise<string | null>
}

interface EstudiantesScreenProps {
  students: Student[]
  courses: Course[]
  perms: PermMap
  loading?: boolean
  error?: string | null
  onStudents: StudentMutations
  onCourses: CourseMutations
}

/**
 * Shell de «Estudiantes y cursos»: dos pestañas sobre los mismos datos.
 * El estado de dominio (students/courses) viene del hook vía la página;
 * el estado UI (tab, filtros, toasts) vive aquí.
 */
export function EstudiantesScreen({
  students,
  courses,
  perms,
  loading,
  error,
  onStudents,
  onCourses,
}: EstudiantesScreenProps) {
  const [tab, setTab] = useState("estudiantes")
  const [courseFilter, setCourseFilter] = useState("all")
  const [toast, setToast] = useState<Toast>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const flash = (variant: "success" | "info", msg: string) => {
    setToast({ variant, msg, k: Date.now() })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2800)
  }

  const onViewStudents = (cid: string) => {
    setCourseFilter(cid)
    setTab("estudiantes")
    flash("info", `Mostrando alumnos de ${courses.find((c) => c.id === cid)?.name ?? ""}.`)
  }

  const tabs = [
    { value: "estudiantes", label: "Estudiantes", count: students.filter((s) => s.status !== "DELETED").length },
    { value: "cursos", label: "Cursos", count: courses.filter((c) => c.status === "ACTIVE").length },
  ]

  return (
    <div className="mx-auto max-w-[1120px] px-8 pt-[26px] pb-[72px]">
      <header className="mb-[18px] flex flex-wrap items-start justify-between gap-5">
        <div>
          <h1 className="text-2xl leading-tight font-semibold tracking-tight">
            Estudiantes y cursos
          </h1>
          <p className="mt-2 max-w-[58ch] text-sm text-muted text-pretty">
            Administra alumnos, apoderados y cursos. Matricula y traslada alumnos entre
            cursos.
          </p>
        </div>
      </header>

      <div className="mb-[18px]">
        <Tabs tabs={tabs} value={tab} onValueChange={setTab} />
      </div>

      {error && (
        <div className="mb-3.5">
          <Alert variant="danger">{error}</Alert>
        </div>
      )}

      {toast && (
        <div className="mb-3.5" key={toast.k}>
          <Alert variant={toast.variant}>{toast.msg}</Alert>
        </div>
      )}

      {loading && !students.length && !courses.length ? (
        <div className="flex items-center justify-center py-20 text-[13.5px] text-muted">
          Cargando…
        </div>
      ) : tab === "estudiantes" ? (
        <StudentsPanel
          students={students}
          courses={courses}
          perms={perms}
          onCreate={onStudents.create}
          onUpdate={onStudents.update}
          onTransfer={onStudents.transfer}
          onDelete={onStudents.delete}
          flash={flash}
          courseFilter={courseFilter}
          setCourseFilter={setCourseFilter}
        />
      ) : (
        <CoursesPanel
          courses={courses}
          students={students}
          perms={perms}
          onCreate={onCourses.create}
          onUpdate={onCourses.update}
          onDelete={onCourses.delete}
          flash={flash}
          onViewStudents={onViewStudents}
        />
      )}
    </div>
  )
}
