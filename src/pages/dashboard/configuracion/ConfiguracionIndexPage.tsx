import { useNavigate } from "react-router-dom"

import { ConfiguracionDocumento } from "@/components/configuracion/configuracion-documento"
import { settingsSections } from "@/data/configuracion-stub"

/**
 * Índice de Configuración: el documento de secciones (`/dashboard/configuracion`).
 * Container: inyecta las secciones stub que en producción vendrán de Auth y otros MS.
 */
export function ConfiguracionIndexPage() {
  const navigate = useNavigate()
  return (
    <ConfiguracionDocumento
      sections={settingsSections}
      onOpenPanel={(panel) => navigate(`/dashboard/configuracion/${panel}`)}
    />
  )
}
