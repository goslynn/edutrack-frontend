import { useOutletContext } from "react-router-dom"

import { AnotacionesScreen } from "@/components/anotaciones/anotaciones-screen"
import type { DashboardOutletContext } from "@/components/dashboard/dashboard-layout"
import { useAnotaciones } from "@/hooks/useAnotaciones"

/**
 * Sección Anotaciones (`/dashboard/anotaciones`). Container: orquesta el hook
 * `useAnotaciones` con el `courseId` real del contexto del layout e inyecta los
 * callbacks de API en la pantalla.
 */
export function AnotacionesPage() {
  const { courseId, courseName } = useOutletContext<DashboardOutletContext>()
  const {
    annotations,
    roster,
    currentTeacher,
    today,
    loading,
    error,
    createAnnotation,
    deleteAnnotation,
  } = useAnotaciones(courseId)

  return (
    <AnotacionesScreen
      courseName={courseName}
      annotations={annotations}
      roster={roster}
      today={today}
      currentTeacher={currentTeacher}
      loading={loading}
      error={error}
      onCreateAnnotation={createAnnotation}
      onDeleteAnnotation={deleteAnnotation}
    />
  )
}
