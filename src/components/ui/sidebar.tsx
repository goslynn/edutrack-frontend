import { useState, type ReactNode } from "react"
import { ChevronLeftIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export interface NavItem {
  id: string
  /** Ruta a la que navega el ítem (la inyecta la config de navegación). */
  path: string
  label: ReactNode
  icon?: ReactNode
  badge?: ReactNode
  badgeTone?: "default" | "accent"
}

export interface NavGroup {
  label?: string
  items: NavItem[]
}

interface SidebarProps {
  groups: NavGroup[]
  active?: string
  onNavigate?: (id: string) => void
  /** Controlado: estado de colapso. Si se omite, el componente lo autogestiona. */
  collapsed?: boolean
  defaultCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  collapsible?: boolean
  brand?: ReactNode
  brandCollapsed?: ReactNode
  footer?: ReactNode
  className?: string
}

/**
 * Navegación principal de la app. Visual puro y data-driven: el routing entra
 * por `active` + `onNavigate`. Colapsable entre panel completo (248px) y rail de
 * iconos (68px). Acepta cualquier nodo como icono de ítem (en la app,
 * un icono de `lucide-react`).
 */
function Sidebar({
  groups,
  active,
  onNavigate,
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  collapsible = true,
  brand,
  brandCollapsed,
  footer,
  className,
}: SidebarProps) {
  const [internal, setInternal] = useState(defaultCollapsed)
  const isCollapsed = collapsed ?? internal

  const toggle = () => {
    const next = !isCollapsed
    if (collapsed === undefined) setInternal(next)
    onCollapsedChange?.(next)
  }

  return (
    <aside
      data-collapsed={isCollapsed}
      className={cn(
        "group/sb relative z-10 flex h-full w-[248px] flex-none flex-col border-r border-border bg-background transition-[width] duration-200",
        "data-[collapsed=true]:w-[68px]",
        className
      )}
    >
      {/* cabecera + marca */}
      <div className="flex h-[var(--header-height,56px)] flex-none items-center gap-2.5 pr-3.5 pl-[18px] group-data-[collapsed=true]/sb:justify-center group-data-[collapsed=true]/sb:px-0">
        <div className="flex min-w-0 flex-1 items-center gap-2.5 overflow-hidden text-[17px] font-semibold tracking-tight whitespace-nowrap text-foreground group-data-[collapsed=true]/sb:flex-none group-data-[collapsed=true]/sb:justify-center">
          {isCollapsed ? (brandCollapsed ?? brand) : brand}
        </div>
        {collapsible && (
          <button
            type="button"
            onClick={toggle}
            aria-label={isCollapsed ? "Expandir menú" : "Contraer menú"}
            title={isCollapsed ? "Expandir" : "Contraer"}
            className="absolute top-3.5 -right-[13px] z-30 flex size-[26px] items-center justify-center rounded-full border border-border bg-background text-muted shadow-xs transition-all outline-none hover:bg-surface hover:text-foreground hover:shadow-sm focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <ChevronLeftIcon className="size-[15px] transition-transform duration-200 group-data-[collapsed=true]/sb:rotate-180" />
          </button>
        )}
      </div>

      {/* navegación */}
      <nav
        aria-label="Navegación principal"
        className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-x-hidden overflow-y-auto px-2.5 pt-1.5 pb-2.5"
      >
        {groups.map((group, index) => (
          <div
            key={group.label ?? index}
            className="flex flex-col gap-0.5 not-first:mt-3.5"
          >
            {group.label && (
              <div className="px-3 pt-1.5 pb-1 text-[11px] font-semibold tracking-[0.06em] whitespace-nowrap text-muted uppercase group-data-[collapsed=true]/sb:hidden">
                {group.label}
              </div>
            )}
            {group.items.map((item) => {
              const isActive = active === item.id
              const hasBadge = item.badge != null && item.badge !== ""
              return (
                <button
                  key={item.id}
                  type="button"
                  data-active={isActive}
                  aria-current={isActive ? "page" : undefined}
                  title={
                    isCollapsed && typeof item.label === "string"
                      ? item.label
                      : undefined
                  }
                  onClick={() => onNavigate?.(item.id)}
                  className="relative flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-[13.5px] leading-none font-medium text-muted transition-colors outline-none hover:bg-surface hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-[active=true]:bg-primary-soft data-[active=true]:text-primary group-data-[collapsed=true]/sb:justify-center group-data-[collapsed=true]/sb:px-0 group-data-[collapsed=true]/sb:py-2.5"
                >
                  {item.icon && (
                    <span className="flex size-[18px] flex-none items-center justify-center [&_svg]:size-[18px]">
                      {item.icon}
                    </span>
                  )}
                  <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap group-data-[collapsed=true]/sb:hidden">
                    {item.label}
                  </span>
                  {hasBadge && (
                    <>
                      <span
                        className={cn(
                          "flex-none rounded-full px-[7px] py-0.5 font-mono text-[11px] font-semibold group-data-[collapsed=true]/sb:hidden",
                          item.badgeTone === "accent"
                            ? "bg-accent-soft text-accent"
                            : isActive
                              ? "bg-primary text-primary-foreground"
                              : "bg-border text-foreground"
                        )}
                      >
                        {item.badge}
                      </span>
                      <span className="absolute top-1.5 right-3.5 hidden size-[7px] rounded-full bg-accent ring-2 ring-background group-data-[collapsed=true]/sb:block" />
                    </>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      {footer && (
        <div className="flex-none border-t border-border p-2.5">{footer}</div>
      )}
    </aside>
  )
}

export { Sidebar }
