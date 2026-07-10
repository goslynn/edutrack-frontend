import { useEffect, type ReactNode } from "react"

import { cn } from "@/lib/utils"

const SIZE = {
  sm: "max-w-[424px]",
  md: "max-w-[500px]",
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
