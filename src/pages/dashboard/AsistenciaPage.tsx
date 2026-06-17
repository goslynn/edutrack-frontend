import { useOutletContext } from "react-router-dom"

import { AsistenciaScreen } from "@/components/asistencia/asistencia-screen"
import type { DashboardOutletContext } from "@/components/dashboard/dashboard-layout"
import { asistenciaData } from "@/data/asistencia-stub"

/**
 * Sección Asistencia (`/dashboard/asistencia`). Container: inyecta el bundle de
 * datos stub que en producción vendrá de los MS Attendance / Course / Student.
 */
export function AsistenciaPage() {
  const { courseName } = useOutletContext<DashboardOutletContext>()
  return <AsistenciaScreen courseName={courseName} data={asistenciaData} />
}
