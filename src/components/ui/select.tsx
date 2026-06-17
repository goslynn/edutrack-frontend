import type { ComponentPropsWithoutRef } from "react"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface SelectProps extends ComponentPropsWithoutRef<"select"> {
  /** Clase del contenedor (controla ancho/posición); `className` va al `<select>`. */
  wrapperClassName?: string
}

/**
 * Select nativo estilizado con el contrato de tokens. Visual puro: forwardea
 * todas las props del `<select>` (`value`/`defaultValue`/`onChange`/`disabled`…).
 * El ancho se controla desde el contenedor con `wrapperClassName`.
 */
function Select({ className, wrapperClassName, children, ...props }: SelectProps) {
  return (
    <span
      data-slot="select"
      className={cn("relative inline-flex items-center", wrapperClassName)}
    >
      <select
        className={cn(
          "h-8 w-full cursor-pointer appearance-none rounded-md border border-border bg-background py-1 pr-8 pl-2.5 text-sm font-medium text-foreground transition-colors outline-none hover:bg-surface focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDownIcon
        className="pointer-events-none absolute right-2.5 size-[15px] text-muted"
        aria-hidden
      />
    </span>
  )
}

export { Select }
