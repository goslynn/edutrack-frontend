import type { ComponentPropsWithoutRef, ReactNode } from "react"

import { cn } from "@/lib/utils"

interface DashboardPanelProps
  extends Omit<ComponentPropsWithoutRef<"section">, "title"> {
  title: ReactNode
  hint?: ReactNode
  children: ReactNode
}

/** Panel-tarjeta del dashboard: cabecera (título + pista) y cuerpo. */
export function DashboardPanel({
  title,
  hint,
  children,
  className,
  ...props
}: DashboardPanelProps) {
  return (
    <section
      className={cn(
        "flex min-w-0 flex-col rounded-xl bg-background ring-1 ring-foreground/10",
        className
      )}
      {...props}
    >
      <div className="flex items-baseline justify-between gap-2.5 px-[18px] pt-4 pb-0.5">
        <span className="text-[14.5px] font-semibold">{title}</span>
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </div>
      <div className="px-3.5 pt-2.5 pb-4">{children}</div>
    </section>
  )
}
