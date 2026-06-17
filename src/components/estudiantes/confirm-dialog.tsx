import { Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ModalShell } from "./modal-shell"

interface ConfirmDialogProps {
  title: string
  description: string
  /** Texto del botón de acción. */
  confirmLabel: string
  /** Bloquea la acción (p. ej. un curso con alumnos activos). */
  disabled?: boolean
  onClose: () => void
  onConfirm: () => void
}

/** Confirmación de borrado lógico (centrada, ícono de peligro). */
export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  disabled,
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <ModalShell size="sm" onClose={onClose} label={title}>
      <div className="flex flex-col items-center gap-2.5 px-[26px] pt-[30px] pb-[22px] text-center">
        <span className="mb-1 grid size-[50px] place-items-center rounded-[14px] bg-danger/[0.12] text-danger">
          <Trash2Icon className="size-[22px]" />
        </span>
        <div className="text-base font-semibold">{title}</div>
        <div className="max-w-[40ch] text-[13px] leading-normal text-muted text-pretty">
          {description}
        </div>
      </div>
      <div className="flex items-center justify-center gap-4 border-t border-border px-[22px] pt-3.5 pb-[18px]">
        <button
          type="button"
          onClick={onClose}
          className="px-1 py-1.5 text-[13px] font-semibold text-muted transition-colors outline-none hover:text-foreground"
        >
          Cancelar
        </button>
        <Button variant="destructive" disabled={disabled} onClick={onConfirm}>
          <Trash2Icon /> {confirmLabel}
        </Button>
      </div>
    </ModalShell>
  )
}
