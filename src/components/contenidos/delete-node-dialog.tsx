import { Trash2Icon } from "lucide-react"

import type { ContentNode, Level } from "@/types/contenidos"
import { Button } from "@/components/ui/button"
import { ModalShell } from "./modal-shell"

interface DeleteNodeDialogProps {
  node: ContentNode
  level: Level
  /** Partes del subárbol ya formateadas ("2 unidades", "5 archivos"). */
  cascade: string[]
  loading?: boolean
  error?: string | null
  onClose: () => void
  onConfirm: () => void
}

/** Une con comas y una «y» final: ["a","b","c"] → "a, b y c". */
function joinEs(parts: string[]): string {
  if (parts.length <= 1) return parts.join("")
  return parts.slice(0, -1).join(", ") + " y " + parts[parts.length - 1]
}

/** Confirma el borrado en cascada de un nodo y todo su subárbol. */
export function DeleteNodeDialog({
  node,
  level,
  cascade,
  loading,
  error,
  onClose,
  onConfirm,
}: DeleteNodeDialogProps) {
  const lower = level.name.toLowerCase()
  return (
    <ModalShell size="sm" onClose={onClose} label={`Eliminar ${node.name}`}>
      <div className="flex flex-col items-center gap-2.5 px-[26px] pt-[30px] pb-[22px] text-center">
        <span className="mb-1 grid size-[50px] place-items-center rounded-[14px] bg-danger/[0.12] text-danger">
          <Trash2Icon className="size-[22px]" />
        </span>
        <div className="text-base font-semibold">Eliminar «{node.name}»</div>
        <div className="max-w-[42ch] text-[13px] leading-normal text-muted text-pretty">
          {cascade.length > 0 ? (
            <>
              Esto eliminará <b>en cascada</b> {joinEs(cascade)}. Esta acción no se puede deshacer.
            </>
          ) : (
            <>Se eliminará este {lower}. Esta acción no se puede deshacer.</>
          )}
        </div>
      </div>
      {error && (
        <p className="px-[22px] pb-1 text-center text-[12.5px] text-danger">{error}</p>
      )}
      <div className="flex items-center justify-center gap-4 border-t border-border px-[22px] pt-3.5 pb-[18px]">
        <button
          type="button"
          onClick={onClose}
          className="px-1 py-1.5 text-[13px] font-semibold text-muted transition-colors outline-none hover:text-foreground"
        >
          Cancelar
        </button>
        <Button variant="destructive" disabled={loading} onClick={onConfirm}>
          <Trash2Icon /> Eliminar todo
        </Button>
      </div>
    </ModalShell>
  )
}
