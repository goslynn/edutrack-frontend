import { ArrowRightIcon, HistoryIcon, PencilIcon, PlusIcon, UserIcon } from "lucide-react"

import type { Evaluation, GradeAuditEntry, RosterStudent } from "@/types/calificaciones"
import { cn } from "@/lib/utils"
import { ModalHeader, ModalShell } from "./modal-shell"
import { fmtDateTime, fmtGrade, studentName } from "./calificaciones-meta"

interface HistoryModalProps {
  student: RosterStudent
  evaluation: Evaluation
  entries: GradeAuditEntry[] | null | undefined
  /** Resolución id → nombre del autor del cambio. */
  users: Record<string, string>
  onClose: () => void
}

/** Historial de cambios de una nota (auditoría inmutable, más reciente primero). */
export function HistoryModal({ student, evaluation, entries, users, onClose }: HistoryModalProps) {
  const ordered = [...(entries ?? [])].reverse()

  return (
    <ModalShell onClose={onClose} label="Historial de la nota">
      <ModalHeader
        title="Historial de la nota"
        subtitle={`${studentName(student)} · ${evaluation.name}`}
        onClose={onClose}
      />

      <div className="overflow-auto px-[22px] py-4">
        {ordered.length === 0 ? (
          <div className="flex flex-col items-center gap-2.5 p-12 text-center text-[13.5px] text-muted">
            <HistoryIcon className="size-[22px] text-border" />
            <div>Sin cambios registrados.</div>
          </div>
        ) : (
          <ol className="flex flex-col">
            {ordered.map((e, i) => {
              const alta = e.oldValue == null
              const last = i === ordered.length - 1
              return (
                <li key={e.id} className="relative flex gap-3.5 pb-[18px]">
                  {!last && (
                    <span className="absolute top-7 bottom-0 left-[13px] w-px bg-border" aria-hidden />
                  )}
                  <span
                    className={cn(
                      "z-[1] grid size-[27px] flex-none place-items-center rounded-full border",
                      alta
                        ? "border-transparent bg-primary-soft text-primary"
                        : "border-border bg-surface text-muted"
                    )}
                  >
                    {alta ? <PlusIcon className="size-3" /> : <PencilIcon className="size-3" />}
                  </span>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex items-center justify-between gap-2.5">
                      <span className="text-[13.5px] font-semibold">
                        {alta ? "Nota registrada" : "Nota corregida"}
                      </span>
                      <span className="inline-flex items-center gap-1.5 font-mono text-sm tabular-nums">
                        {!alta && (
                          <span className="text-muted line-through">{fmtGrade(e.oldValue)}</span>
                        )}
                        {!alta && <ArrowRightIcon className="size-[13px] text-muted" />}
                        <b>{fmtGrade(e.newValue)}</b>
                      </span>
                    </div>
                    <div className="mt-[5px] flex items-center gap-3.5 text-[12.5px] text-muted">
                      <span className="inline-flex items-center gap-1.5">
                        <UserIcon className="size-3" /> {users[e.changedBy] ?? e.changedBy}
                      </span>
                      <span className="font-mono tabular-nums">{fmtDateTime(e.changedAt)}</span>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 border-t border-border px-[22px] pt-3.5 pb-[18px]">
        <button
          type="button"
          onClick={onClose}
          className="px-1 py-1.5 text-[13px] font-semibold text-muted transition-colors outline-none hover:text-foreground"
        >
          Cerrar
        </button>
      </div>
    </ModalShell>
  )
}
