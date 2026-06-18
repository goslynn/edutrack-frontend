import { LockIcon, Trash2Icon } from "lucide-react"

import type { Evaluation } from "@/types/calificaciones"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ModalShell } from "./modal-shell"

interface ConfirmDeleteEvalProps {
  evaluation: Evaluation
  /** Notas registradas en la evaluación: > 0 bloquea el borrado (409 Conflict). */
  gradeCount: number
  onClose: () => void
  onConfirm: () => void
}

/**
 * Confirmación de borrado de una evaluación. Si tiene notas, el backend responde
 * 409: el diálogo lo refleja bloqueando la acción y explicando el porqué.
 */
export function ConfirmDeleteEval({
  evaluation,
  gradeCount,
  onClose,
  onConfirm,
}: ConfirmDeleteEvalProps) {
  const blocked = gradeCount > 0
  return (
    <ModalShell size="sm" onClose={onClose} label="Eliminar evaluación">
      <div className="flex flex-col items-center gap-2.5 px-[26px] pt-[30px] pb-[22px] text-center">
        <span
          className={cn(
            "mb-1 grid size-[50px] place-items-center rounded-[14px]",
            blocked ? "bg-warning-soft text-warning-strong" : "bg-danger/10 text-danger"
          )}
        >
          {blocked ? <LockIcon className="size-[22px]" /> : <Trash2Icon className="size-[22px]" />}
        </span>
        <div className="text-base font-semibold">
          {blocked ? "No se puede eliminar" : `¿Eliminar «${evaluation.name}»?`}
        </div>
        <div className="max-w-[42ch] text-[13px] leading-normal text-muted text-pretty">
          {blocked
            ? `La evaluación tiene ${gradeCount} nota${gradeCount === 1 ? "" : "s"} registrada${
                gradeCount === 1 ? "" : "s"
              }. Elimina primero las notas para poder borrarla (el backend responde 409 Conflict).`
            : "La evaluación se eliminará de forma permanente. Como no tiene notas registradas, la operación es segura."}
        </div>
      </div>
      <div className="flex items-center justify-center gap-4 border-t border-border px-[22px] pt-3.5 pb-[18px]">
        <button
          type="button"
          onClick={onClose}
          className="px-1 py-1.5 text-[13px] font-semibold text-muted transition-colors outline-none hover:text-foreground"
        >
          {blocked ? "Entendido" : "Cancelar"}
        </button>
        {!blocked && (
          <Button variant="destructive" onClick={onConfirm}>
            <Trash2Icon /> Eliminar
          </Button>
        )}
      </div>
    </ModalShell>
  )
}
