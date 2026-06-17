import { useEffect, useRef } from "react"
import { Outlet, useNavigate, useParams } from "react-router-dom"

import { settingsPanels } from "@/data/configuracion-stub"
import { ConfiguracionBreadcrumb } from "@/components/configuracion/configuracion-breadcrumb"

/**
 * Cascarón de Configuración (`/dashboard/configuracion`): breadcrumb fijo +
 * `<Outlet>`. El índice muestra el documento de secciones; cada panel cuelga de
 * `/dashboard/configuracion/<panel>` como ruta propia (atrás/adelante). El
 * breadcrumb deriva su estado del `:panelId` de la URL.
 */
export function ConfiguracionPage() {
  const navigate = useNavigate()
  const { panelId } = useParams()
  const rootRef = useRef<HTMLDivElement>(null)

  const panelLabel = panelId
    ? settingsPanels[panelId]?.label ?? "Panel"
    : undefined

  // Al abrir/cerrar un panel, vuelve al inicio del scroll (el <main> persiste).
  useEffect(() => {
    rootRef.current?.closest("main")?.scrollTo({ top: 0 })
  }, [panelId])

  return (
    <div ref={rootRef}>
      <ConfiguracionBreadcrumb
        onGoInicio={() => navigate("/dashboard")}
        onGoConfiguracion={() => navigate("/dashboard/configuracion")}
        panelLabel={panelLabel}
      />
      <Outlet />
    </div>
  )
}
