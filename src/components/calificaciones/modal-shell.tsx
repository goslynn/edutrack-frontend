import { useEffect, type ReactNode } from "react"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const SIZE = {
  sm: "max-w-[420px]",
  md: "max-w-[482px]",
  lg: "max-w-[560px]",
} as const

interface ModalShellProps {
  size?: keyof typeof SIZE
  onClose: () => void
  label?: string
  children: ReactNode
}

/** Overlay + tarjeta de diálogo. Cierra con Escape o clic en el backdrop. */
export function ModalShell({ size = "md", onClose, label, children }: ModalShellProps) {
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
        aria-label={label}
        className={cn(
          "flex max-h-[92vh] w-full flex-col rounded-2xl bg-background shadow-lg",
          SIZE[size]
        )}
      >
        {children}
      </div>
    </div>
  )
}

/** Encabezado estándar de diálogo: título + subtítulo + botón cerrar. */
export function ModalHeader({
  title,
  subtitle,
  onClose,
}: {
  title: string
  subtitle?: ReactNode
  onClose: () => void
}) {
  return (
    <div className="flex items-start justify-between gap-3 px-[22px] pt-5">
      <div>
        <div className="text-[17px] font-semibold -tracking-[0.01em]">{title}</div>
        {subtitle && <div className="mt-[3px] text-[13px] text-muted">{subtitle}</div>}
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
  )
}
