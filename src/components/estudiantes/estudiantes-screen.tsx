import { useRef, useState } from "react"

import type { Course, PermMap, Student } from "@/types/estudiantes"
import { Alert } from "@/components/ui/alert"
import { Tabs } from "@/components/ui/tabs"
import { StudentsPanel } from "./students-panel"
import { CoursesPanel } from "./courses-panel"

type Toast = { variant: "success" | "info"; msg: string; k: number } | null

interface EstudiantesScreenProps {
  /** Alumnos semilla (en producción, de MS-Student). */
  students: Student[]
  /** Cursos semilla (en producción, de MS-Course). */
  courses: Course[]
  /** Permisos RBAC del usuario en sesión (única expresión de autorización). */
  perms: PermMap
}

/**
 * Contenedor de «Estudiantes y cursos»: dos pestañas (Estudiantes · Cursos)
 * sobre el mismo conjunto de datos, con CRUD y la relación entre ambos
 * (matricular / trasladar). Las mutaciones solo afectan estado local de UI; en
 * producción invocan MS-Student / MS-Course vía hooks contenedores. El mapa de
 * permisos (RBAC) lo aporta la sesión y es la única expresión de autorización.
 */
export function EstudiantesScreen({
  students: seedStudents,
  courses: seedCourses,
  perms,
}: EstudiantesScreenProps) {
  const [students, setStudents] = useState<Student[]>(() =>
    seedStudents.map((s) => ({ ...s, guardians: s.guardians.map((g) => ({ ...g })) }))
  )
  const [courses, setCourses] = useState<Course[]>(() => seedCourses.map((c) => ({ ...c })))
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

      {toast && (
        <div className="mb-3.5" key={toast.k}>
          <Alert variant={toast.variant}>{toast.msg}</Alert>
        </div>
      )}

      {tab === "estudiantes" ? (
        <StudentsPanel
          students={students}
          courses={courses}
          perms={perms}
          onChange={setStudents}
          flash={flash}
          courseFilter={courseFilter}
          setCourseFilter={setCourseFilter}
        />
      ) : (
        <CoursesPanel
          courses={courses}
          students={students}
          perms={perms}
          onChange={setCourses}
          flash={flash}
          onViewStudents={onViewStudents}
        />
      )}
    </div>
  )
}
