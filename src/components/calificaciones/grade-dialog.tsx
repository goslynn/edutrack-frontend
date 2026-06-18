import { useEffect, useRef, useState } from "react"
import { CheckIcon, HistoryIcon } from "lucide-react"

import type { Evaluation, RosterStudent } from "@/types/calificaciones"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ModalHeader, ModalShell } from "./modal-shell"
import { GradeBadge } from "./grade-badge"
import { fmtGrade, parseGrade, round1, scoreValid, studentName } from "./calificaciones-meta"

const req = <span className="text-danger">*</span>

interface GradeDialogProps {
  mode: "register" | "correct"
  student: RosterStudent
  evaluation: Evaluation
  /** Nota actual (solo en modo corregir). */
  current?: number
  onClose: () => void
  onSubmit: (score: number) => void
}

/**
 * Registrar / corregir una nota. Valida el rango 1,0–7,0 (el backend responde 422
 * fuera de él) y, al corregir, exige que la nota cambie. Cada corrección queda en
 * la auditoría inmutable.
 */
export function GradeDialog({
  mode,
  student,
  evaluation,
  current,
  onClose,
  onSubmit,
}: GradeDialogProps) {
  const [raw, setRaw] = useState(mode === "correct" ? fmtGrade(current) : "")
  const [showErr, setShowErr] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 30)
    return () => clearTimeout(t)
  }, [])

  const parsed = parseGrade(raw)
  const empty = parsed == null
  const inRange = scoreValid(parsed)
  const unchanged =
    mode === "correct" && inRange && current != null && round1(parsed) === round1(current)

  const submit = () => {
    if (!inRange || unchanged) return setShowErr(true)
    onSubmit(round1(parsed))
  }

  return (
    <ModalShell size="sm" onClose={onClose} label={mode === "correct" ? "Corregir nota" : "Registrar nota"}>
      <ModalHeader
        title={mode === "correct" ? "Corregir nota" : "Registrar nota"}
        subtitle={`${studentName(student)} · ${evaluation.name}`}
        onClose={onClose}
      />

      <div className="overflow-auto px-[22px] py-4">
        <div className="flex flex-col gap-4">
          {mode === "correct" && (
            <div className="flex items-center justify-between gap-3 pt-0.5 pb-1.5 text-[13.5px]">
              <span className="text-muted">Nota actual</span>
              <GradeBadge score={current} />
            </div>
          )}

          <Field data-invalid={showErr && (empty || !inRange)}>
            <FieldLabel htmlFor="g-score">Nota {req}</FieldLabel>
            <Input
              ref={inputRef}
              id="g-score"
              value={raw}
              placeholder="5,9"
              inputMode="decimal"
              aria-invalid={showErr && (empty || !inRange)}
              onChange={(e) => setRaw(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit()
              }}
            />
            {showErr && empty ? (
              <FieldError>Ingresa una nota.</FieldError>
            ) : showErr && !inRange ? (
              <FieldError>La nota debe estar entre 1,0 y 7,0 (el backend responde 422).</FieldError>
            ) : showErr && unchanged ? (
              <FieldError>La nota no cambió.</FieldError>
            ) : (
              <FieldDescription>Escala chilena 1,0 – 7,0. Usa coma decimal.</FieldDescription>
            )}
          </Field>

          {mode === "correct" && (
            <div className="flex items-start gap-3 rounded-lg border-[1.5px] border-dashed border-border px-4 py-3.5 text-muted">
              <HistoryIcon className="mt-px size-[18px] flex-none text-primary" />
              <div>
                <div className="text-[13.5px] font-semibold text-foreground">
                  Queda registrado en la auditoría
                </div>
                <div className="mt-0.5 text-[12.5px] leading-normal">
                  Cada corrección guarda el valor anterior, el nuevo, el usuario y la fecha. El
                  historial es inmutable.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border px-[22px] pt-3.5 pb-[18px]">
        <button
          type="button"
          onClick={onClose}
          className="px-1 py-1.5 text-[13px] font-semibold text-muted transition-colors outline-none hover:text-foreground"
        >
          Cancelar
        </button>
        <Button onClick={submit}>
          <CheckIcon /> {mode === "correct" ? "Guardar corrección" : "Registrar nota"}
        </Button>
      </div>
    </ModalShell>
  )
}
