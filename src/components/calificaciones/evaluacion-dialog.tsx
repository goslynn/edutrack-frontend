import { useState } from "react"
import { CheckIcon, ScaleIcon, TriangleAlertIcon } from "lucide-react"

import type { Evaluation, Subject } from "@/types/calificaciones"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ModalHeader, ModalShell } from "./modal-shell"
import { round1 } from "./calificaciones-meta"

export interface EvaluationForm {
  name: string
  evaluationDate: string
  weight: number
}

interface EvaluacionDialogProps {
  mode: "create" | "edit"
  initial?: Evaluation
  subject: Subject
  period: string
  /** Ponderación ya usada por las evaluaciones del periodo (incluye la editada). */
  weightUsed: number
  onClose: () => void
  onSubmit: (data: EvaluationForm) => void
}

const req = <span className="text-danger">*</span>

/**
 * Alta/edición de una evaluación. Valida nombre (≤150), fecha y ponderación
 * (0, 100], y proyecta la ponderación acumulada del periodo para avisar si supera
 * el 100%.
 */
export function EvaluacionDialog({
  mode,
  initial,
  subject,
  period,
  weightUsed,
  onClose,
  onSubmit,
}: EvaluacionDialogProps) {
  const [name, setName] = useState(initial?.name ?? "")
  const [evaluationDate, setDate] = useState(initial?.evaluationDate ?? "")
  const [weight, setWeight] = useState(initial ? String(initial.weight) : "")
  const [showErr, setShowErr] = useState(false)

  const w = Number(String(weight).replace(",", "."))
  const nameOk = name.trim().length > 0 && name.trim().length <= 150
  const dateOk = !!evaluationDate
  const weightOk = !Number.isNaN(w) && w > 0 && w <= 100
  const valid = nameOk && dateOk && weightOk

  // Ponderación de las demás evaluaciones (excluye la que se edita).
  const otherWeight = weightUsed - (mode === "edit" && initial ? initial.weight : 0)
  const projected = otherWeight + (weightOk ? w : 0)
  const over = projected > 100

  const submit = () => {
    if (!valid) return setShowErr(true)
    onSubmit({ name: name.trim(), evaluationDate, weight: round1(w) })
  }

  return (
    <ModalShell onClose={onClose} label={mode === "edit" ? "Editar evaluación" : "Nueva evaluación"}>
      <ModalHeader
        title={mode === "edit" ? "Editar evaluación" : "Nueva evaluación"}
        subtitle={`${subject.name} · ${subject.course} · Periodo ${period}`}
        onClose={onClose}
      />

      <div className="overflow-auto px-[22px] py-4">
        <div className="flex flex-col gap-4">
          <Field data-invalid={showErr && !nameOk}>
            <FieldLabel htmlFor="ev-nm">Nombre de la evaluación {req}</FieldLabel>
            <Input
              id="ev-nm"
              value={name}
              maxLength={150}
              placeholder="Prueba Unidad 1: Números enteros"
              aria-invalid={showErr && !nameOk}
              onChange={(e) => setName(e.target.value)}
            />
            {showErr && !nameOk ? (
              <FieldError>Ingresa un nombre (máx. 150 caracteres).</FieldError>
            ) : (
              <FieldDescription>Máximo 150 caracteres.</FieldDescription>
            )}
          </Field>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <Field data-invalid={showErr && !dateOk}>
              <FieldLabel htmlFor="ev-dt">Fecha de la evaluación {req}</FieldLabel>
              <Input
                id="ev-dt"
                type="date"
                value={evaluationDate}
                aria-invalid={showErr && !dateOk}
                onChange={(e) => setDate(e.target.value)}
              />
              {showErr && !dateOk && <FieldError>Requerida.</FieldError>}
            </Field>
            <Field data-invalid={showErr && !weightOk}>
              <FieldLabel htmlFor="ev-wt">Ponderación (%) {req}</FieldLabel>
              <Input
                id="ev-wt"
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={weight}
                placeholder="30"
                aria-invalid={showErr && !weightOk}
                onChange={(e) => setWeight(e.target.value)}
              />
              {showErr && !weightOk ? (
                <FieldError>Debe estar en el rango (0, 100].</FieldError>
              ) : (
                <FieldDescription>Mayor que 0 y hasta 100.</FieldDescription>
              )}
            </Field>
          </div>

          <div
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3.5 py-3 text-[13px] leading-snug",
              over ? "bg-warning-soft text-warning-strong" : "bg-surface text-muted"
            )}
          >
            {over ? (
              <TriangleAlertIcon className="size-[15px] flex-none" />
            ) : (
              <ScaleIcon className="size-[15px] flex-none text-primary" />
            )}
            <span>
              Ponderación del periodo:{" "}
              <b className={cn("font-mono tabular-nums", over ? "text-warning-strong" : "text-foreground")}>
                {round1(projected)}%
              </b>
              {over
                ? " — supera el 100%."
                : projected === 100
                  ? " — completa."
                  : ` de 100% (${round1(100 - projected)}% disponible).`}
            </span>
          </div>
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
          <CheckIcon /> {mode === "edit" ? "Guardar cambios" : "Crear evaluación"}
        </Button>
      </div>
    </ModalShell>
  )
}
