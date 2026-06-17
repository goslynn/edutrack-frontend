import type { ComponentPropsWithoutRef, ReactNode } from "react"
import {
  CircleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  type LucideIcon,
} from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva("flex gap-2.5 rounded-lg p-3 text-[13px]", {
  variants: {
    variant: {
      info: "bg-primary-soft",
      primary: "bg-primary-soft",
      success: "bg-success-soft",
      warning: "bg-warning-soft",
      danger: "bg-danger-soft",
      neutral: "bg-surface",
    },
  },
  defaultVariants: { variant: "info" },
})

const ICON_COLOR: Record<string, string> = {
  info: "text-primary",
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning-strong",
  danger: "text-danger",
  neutral: "text-muted",
}

const DEFAULT_ICON: Record<string, LucideIcon> = {
  info: InfoIcon,
  primary: InfoIcon,
  success: CircleCheckIcon,
  warning: TriangleAlertIcon,
  danger: CircleAlertIcon,
  neutral: InfoIcon,
}

interface AlertProps
  extends Omit<ComponentPropsWithoutRef<"div">, "title">,
    VariantProps<typeof alertVariants> {
  title?: ReactNode
  /** Reemplaza el icono por defecto del variant; `null` lo oculta. */
  icon?: ReactNode
}

/** Mensaje de feedback con tinte suave por estado, icono y título opcional. */
function Alert({
  variant = "info",
  title,
  icon,
  className,
  children,
  ...props
}: AlertProps) {
  const key = variant ?? "info"
  const DefaultIcon = DEFAULT_ICON[key]
  return (
    <div role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
      {icon !== null && (
        <span className={cn("mt-px flex-none [&_svg]:size-[17px]", ICON_COLOR[key])}>
          {icon ?? <DefaultIcon aria-hidden />}
        </span>
      )}
      <div className="min-w-0 flex-1">
        {title && (
          <div className="leading-snug font-semibold text-foreground">{title}</div>
        )}
        <div
          className={cn(
            "leading-normal text-wrap text-foreground",
            title && "mt-0.5 text-muted"
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export { Alert }
