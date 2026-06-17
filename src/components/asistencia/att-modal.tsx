import { useEffect, type ReactNode } from "react"
import { XIcon, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const TONE: Record<string, string> = {
  primary: "bg-primary-soft text-primary",
  danger: "bg-danger-soft text-danger",
  neutral: "bg-surface text-muted",
}

interface ModalProps {
  title: ReactNode
  sub?: ReactNode
  icon?: LucideIcon
  tone?: "primary" | "danger" | "neutral"
  children: ReactNode
  foot?: ReactNode
  onClose: () => void
  wide?: boolean
}

/**
 * Diálogo modal genérico (visual): cierra con Escape o clic en el backdrop.
 * La lógica de qué confirma cada modal vive en quien lo monta.
 */
export function Modal({
  title,
  sub,
  icon: Icon,
  tone = "primary",
  children,
  foot,
  onClose,
  wide,
}: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-40 grid place-items-center bg-foreground/40 p-5"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : undefined}
        className={cn(
          "flex max-h-[92vh] w-full flex-col rounded-2xl bg-background shadow-lg",
          wide ? "max-w-[620px]" : "max-w-[470px]"
        )}
      >
        <div className="flex items-start justify-between gap-3 px-[22px] pt-5 pb-1">
          <div className="flex min-w-0 items-start gap-3">
            {Icon && (
              <span
                className={cn(
                  "grid size-[42px] flex-none place-items-center rounded-xl",
                  TONE[tone]
                )}
              >
                <Icon className="size-5" />
              </span>
            )}
            <div>
              <div className="text-[17px] leading-tight font-semibold -tracking-[0.01em]">
                {title}
              </div>
              {sub && <div className="mt-[3px] text-[13px] text-muted">{sub}</div>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="grid size-8 flex-none place-items-center rounded-md text-muted transition-colors outline-none hover:bg-surface hover:text-foreground"
          >
            <XIcon className="size-[18px]" />
          </button>
        </div>
        <div className="overflow-auto px-[22px] pt-3 pb-1">{children}</div>
        {foot && (
          <div className="mt-3 border-t border-border px-[22px] pt-3.5 pb-[18px]">
            {foot}
          </div>
        )}
      </div>
    </div>
  )
}
