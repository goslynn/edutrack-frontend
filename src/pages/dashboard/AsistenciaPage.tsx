import { useOutletContext } from "react-router-dom"

import { AsistenciaScreen } from "@/components/asistencia/asistencia-screen"
import type { DashboardOutletContext } from "@/components/dashboard/dashboard-layout"
import { useAsistencia } from "@/hooks/useAsistencia"

/**
 * Sección Asistencia (`/dashboard/asistencia`). Container: orquesta el hook
 * `useAsistencia` con el `courseId` real que proviene del contexto del layout
 * (selector de cursos del topbar) e inyecta los callbacks de API en la pantalla.
 */
export function AsistenciaPage() {
  const { courseId, courseName } = useOutletContext<DashboardOutletContext>()
  const { data, loading, error, openSession, closeSession } = useAsistencia(courseId)

  return (
    <AsistenciaScreen
      courseName={courseName}
      data={data}
      loading={loading}
      error={error}
      onOpenSession={openSession}
      onCloseSession={closeSession}
    />
  )
}
