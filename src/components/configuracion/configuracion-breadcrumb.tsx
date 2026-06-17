import { ChevronRightIcon, HouseIcon } from "lucide-react"

interface ConfiguracionBreadcrumbProps {
  /** Vuelve a Inicio (clic en "Inicio"). */
  onGoInicio: () => void
  /** Vuelve al índice de Configuración (clic en "Configuración" desde un panel). */
  onGoConfiguracion: () => void
  /** Etiqueta del panel abierto; si se omite, estamos en el índice. */
  panelLabel?: string
}

/**
 * Ruta de navegación de Configuración. Visual puro: la navegación entra por los
 * handlers `onGo*`. Con `panelLabel` muestra el nivel del panel; sin él, marca
 * "Configuración" como página actual.
 */
export function ConfiguracionBreadcrumb({
  onGoInicio,
  onGoConfiguracion,
  panelLabel,
}: ConfiguracionBreadcrumbProps) {
  const onPanel = panelLabel != null

  return (
    <nav
      aria-label="Ruta de navegación"
      className="flex flex-wrap items-center gap-0.5 border-b border-border bg-background px-5 py-2.5 text-[13px]"
    >
      <button
        type="button"
        onClick={onGoInicio}
        className="inline-flex items-center gap-1.5 rounded-sm px-1.5 py-1 font-medium text-muted transition-colors outline-none hover:bg-surface hover:text-foreground"
      >
        <HouseIcon className="size-3.5" /> Inicio
      </button>
      <ChevronRightIcon className="size-3.5 text-border" />
      {onPanel ? (
        <button
          type="button"
          onClick={onGoConfiguracion}
          className="rounded-sm px-1.5 py-1 font-medium text-muted transition-colors outline-none hover:bg-surface hover:text-foreground"
        >
          Configuración
        </button>
      ) : (
        <span className="px-1.5 py-1 font-semibold text-foreground" aria-current="page">
          Configuración
        </span>
      )}
      {onPanel && (
        <>
          <ChevronRightIcon className="size-3.5 text-border" />
          <span className="px-1.5 py-1 font-semibold text-foreground" aria-current="page">
            {panelLabel}
          </span>
        </>
      )}
    </nav>
  )
}
