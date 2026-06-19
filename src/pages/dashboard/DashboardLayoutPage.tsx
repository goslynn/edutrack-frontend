import { useEffect, useState } from "react"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { dashboardStub } from "@/data/dashboard-stub"
import { useAuth } from "@/context/AuthContext"
import { listCourses } from "@/api/estudiantes"
import type { Course } from "@/types/dashboard"

/**
 * Container del cascarón del dashboard (ruta `/dashboard`). Carga los cursos
 * del usuario desde MS-Course vía BFF (con los UUIDs reales que el resto del
 * dashboard necesita), e inyecta la identidad desde el contexto de autenticación.
 * Mientras carga, usa el stub como placeholder para no bloquear el render.
 */
export function DashboardLayoutPage() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>(dashboardStub.courses)

  useEffect(() => {
    listCourses().then((res) => {
      if (!res.ok) return
      const mapped: Course[] = res.value.map((c) => ({
        id: c.id,
        name: c.name,
        role: "Docente",
        students: 0,
        avg: 0,
        attendance: 0,
      }))
      if (mapped.length > 0) setCourses(mapped)
    })
  }, [])

  const currentUser = {
    name: user?.displayName ?? "…",
    email: user?.email ?? "",
  }

  return (
    <DashboardLayout
      courses={courses}
      notifications={dashboardStub.notifications}
      user={currentUser}
    />
  )
}
