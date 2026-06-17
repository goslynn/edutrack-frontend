import { useOutletContext } from "react-router-dom"

import { AnotacionesScreen } from "@/components/anotaciones/anotaciones-screen"
import type { DashboardOutletContext } from "@/components/dashboard/dashboard-layout"
import { TODAY, currentTeacher, roster, seedAnnotations } from "@/data/anotaciones-stub"

/**
 * Sección Anotaciones (`/dashboard/anotaciones`). Container: inyecta los datos
 * stub que en producción vendrán del Annotation service vía hooks contenedores.
 */
export function AnotacionesPage() {
  const { courseName } = useOutletContext<DashboardOutletContext>()
  return (
    <AnotacionesScreen
      courseName={courseName}
      annotations={seedAnnotations}
      roster={roster}
      today={TODAY}
      currentTeacher={currentTeacher}
    />
  )
}
