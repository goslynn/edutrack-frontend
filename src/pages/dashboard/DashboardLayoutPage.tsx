import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { currentUserStub, dashboardStub } from "@/data/dashboard-stub"

/**
 * Container del cascarón del dashboard (ruta `/dashboard`). Inyecta los datos
 * stub del shell —cursos, notificaciones e identidad— que en producción vendrán
 * de MS-Course y del JWT vía hooks contenedores. El `<DashboardLayout>` sigue
 * siendo el shell visual con `<Outlet>` para las rutas hijas.
 */
export function DashboardLayoutPage() {
  return (
    <DashboardLayout
      courses={dashboardStub.courses}
      notifications={dashboardStub.notifications}
      user={currentUserStub}
    />
  )
}
