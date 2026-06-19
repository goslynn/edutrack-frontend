import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { dashboardStub } from "@/data/dashboard-stub"
import { useAuth } from "@/context/AuthContext"
import { listCourses } from "@/api/estudiantes"
import type { Course } from "@/types/dashboard"
import { Alert } from "@/components/ui/alert"

type CoursesState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ok"; courses: Course[] }

/**
 * Container del cascarón del dashboard (ruta `/dashboard`). Carga los cursos
 * del usuario desde MS-Course vía BFF (con los UUIDs reales que el resto del
 * dashboard necesita), e inyecta la identidad desde el contexto de autenticación.
 * Bloquea el render hasta tener cursos reales; muestra error si la carga falla.
 */
export function DashboardLayoutPage() {
  const { user } = useAuth()
  const [state, setState] = useState<CoursesState>({ status: "loading" })

  useEffect(() => {
    listCourses().then((res) => {
      if (!res.ok) {
        setState({ status: "error", message: "No fue posible cargar los cursos. Intenta recargar la página." })
        return
      }
      const mapped: Course[] = res.value.map((c) => ({
        id: c.id,
        name: c.name,
        role: "Docente",
        students: 0,
        avg: 0,
        attendance: 0,
      }))
      if (mapped.length === 0) {
        setState({ status: "error", message: "No tienes cursos asignados. Contacta al administrador." })
        return
      }
      setState({ status: "ok", courses: mapped })
    })
  }, [])

  if (state.status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <span className="text-sm text-muted">Cargando cursos…</span>
      </div>
    )
  }

  if (state.status === "error") {
    return (
      <div className="flex h-screen items-center justify-center bg-background p-6">
        <Alert variant="danger" title="No se pudo cargar el dashboard" className="max-w-sm">
          {state.message}
        </Alert>
      </div>
    )
  }

  const currentUser = {
    name: user?.displayName ?? "…",
    email: user?.email ?? "",
  }

  return (
    <DashboardLayout
      courses={state.courses}
      notifications={dashboardStub.notifications}
      user={currentUser}
    />
  )
}
