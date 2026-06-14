import type { ComponentPropsWithoutRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border border-transparent text-xs leading-none font-medium whitespace-nowrap [&_svg]:size-3 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        neutral: "border-border bg-surface text-muted",
        primary: "bg-primary-soft text-primary",
        accent: "bg-accent-soft text-accent",
        success: "bg-success-soft text-success",
        warning: "bg-warning-soft text-warning-strong",
        danger: "bg-danger-soft text-danger",
        solid: "bg-primary text-primary-foreground",
      },
      size: {
        default: "px-2 py-[3px]",
        sm: "px-1.5 py-0.5 text-[11px]",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "default",
    },
  }
)

interface BadgeProps
  extends ComponentPropsWithoutRef<"span">,
    VariantProps<typeof badgeVariants> {
  /** Muestra un punto del color actual antes del contenido. */
  dot?: boolean
}

function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {dot && (
        <span className="size-1.5 rounded-full bg-current" aria-hidden />
      )}
      {children}
    </span>
  )
}

export { Badge, badgeVariants }
