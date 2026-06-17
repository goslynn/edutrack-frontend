import { useNavigate, useParams } from "react-router-dom"

import { PanelStub } from "@/components/configuracion/panel-stub"
import { RolesPanel } from "@/components/configuracion/roles-panel"
import { UsuariosPanel } from "@/components/configuracion/usuarios-panel"
import {
  orgUsers,
  permServices,
  rolePermissions,
  roles,
  settingsPanels,
  userRoles,
} from "@/data/configuracion-stub"

/**
 * Panel de Configuración a pantalla completa (`/dashboard/configuracion/:panelId`).
 * Resuelve el panel desde la ruta; "volver" navega al índice de Configuración.
 * Container: inyecta a cada panel los datos stub que en producción vendrán de
 * Auth. Los paneles sin pantalla propia caen en `PanelStub`.
 */
export function ConfiguracionPanelPage() {
  const navigate = useNavigate()
  const { panelId = "" } = useParams()
  const onBack = () => navigate("/dashboard/configuracion")

  if (panelId === "usuarios") {
    return <UsuariosPanel users={orgUsers} roles={userRoles} onBack={onBack} />
  }
  if (panelId === "roles") {
    return (
      <RolesPanel
        roles={roles}
        permServices={permServices}
        rolePermissions={rolePermissions}
        onBack={onBack}
      />
    )
  }

  const meta = settingsPanels[panelId]
  return <PanelStub label={meta?.label} desc={meta?.desc} onBack={onBack} />
}
