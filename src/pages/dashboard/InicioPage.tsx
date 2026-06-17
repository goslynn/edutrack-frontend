import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { dashboardStub } from "@/data/dashboard-stub"
import {
  DashboardHome,
  type DashboardLayout,
} from "@/components/dashboard/dashboard-home"
import { NAV_PATH } from "@/components/dashboard/nav-config"

const LAYOUT_KEY = "et-dash-layout-v1"

/** Home post-login (`/dashboard`): resumen, stats y accesos a las secciones. */
export function InicioPage() {
  const navigate = useNavigate()
  const [layout, setLayout] = useState<DashboardLayout>(
    () => (localStorage.getItem(LAYOUT_KEY) as DashboardLayout | null) ?? "equilibrado"
  )

  useEffect(() => {
    localStorage.setItem(LAYOUT_KEY, layout)
  }, [layout])

  return (
    <DashboardHome
      data={dashboardStub}
      layout={layout}
      onLayoutChange={setLayout}
      onGo={(target) => navigate(NAV_PATH[target])}
    />
  )
}
