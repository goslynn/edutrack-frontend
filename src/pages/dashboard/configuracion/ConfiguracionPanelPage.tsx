import { useNavigate, useParams } from "react-router-dom"

import { PanelStub } from "@/components/configuracion/panel-stub"
import { UsuariosPage } from "./UsuariosPage"
import { RolesPage } from "./RolesPage"
import { settingsPanels } from "@/data/configuracion-stub"

/**
 * Panel de Configuración a pantalla completa (`/dashboard/configuracion/:panelId`).
 * Resuelve el panel desde la ruta; "volver" navega al índice de Configuración.
 * Container: Usuarios consume Auth (vía BFF) en su propio container; el resto
 * inyecta datos stub. Los paneles sin pantalla propia caen en `PanelStub`.
 */
export function ConfiguracionPanelPage() {
  const navigate = useNavigate()
  const { panelId = "" } = useParams()
  const onBack = () => navigate("/dashboard/configuracion")

  if (panelId === "usuarios") {
    return <UsuariosPage onBack={onBack} />
  }
  if (panelId === "roles") {
    return <RolesPage onBack={onBack} />
  }

  const meta = settingsPanels[panelId]
  return <PanelStub label={meta?.label} desc={meta?.desc} onBack={onBack} />
}
