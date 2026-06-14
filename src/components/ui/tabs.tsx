import { useState, type ComponentPropsWithoutRef, type ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface TabItem {
  value: string
  label: ReactNode
  count?: number
}

interface TabsProps extends Omit<ComponentPropsWithoutRef<"div">, "onChange"> {
  tabs: TabItem[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

/**
 * Control segmentado (no las tabs de página). Visual puro: el valor activo se
 * controla desde fuera con `value` + `onValueChange`, o se autogestiona con
 * `defaultValue`.
 */
function Tabs({
  tabs,
  value,
  defaultValue,
  onValueChange,
  className,
  ...props
}: TabsProps) {
  const [internal, setInternal] = useState(defaultValue ?? tabs[0]?.value)
  const active = value ?? internal

  const select = (next: string) => {
    if (value === undefined) setInternal(next)
    onValueChange?.(next)
  }

  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex gap-0.5 rounded-lg border border-border bg-surface p-[3px]",
        className
      )}
      {...props}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.value
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            data-active={isActive}
            onClick={() => select(tab.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-[5px] text-sm leading-none font-medium transition-colors outline-none",
              "text-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
              "data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-xs",
              "[&_svg]:size-3.5 [&_svg]:shrink-0"
            )}
          >
            {tab.label}
            {tab.count != null && (
              <span
                className={cn(
                  "rounded-full bg-border px-1.5 py-px font-mono text-[11px] text-muted",
                  isActive && "bg-primary-soft text-primary"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export { Tabs }
