import { useLocation } from "react-router-dom"

import { SectionPlaceholder } from "@/components/dashboard/section-placeholder"
import { idFromPath } from "@/components/dashboard/nav-config"

/** Páginas de secciones aún sin pantalla propia; el id se deriva de la ruta. */
export function PlaceholderPage() {
  const { pathname } = useLocation()
  return <SectionPlaceholder sectionId={idFromPath(pathname)} />
}
