import { useState } from "react"
import { CheckIcon, XIcon } from "lucide-react"

import type { Course } from "@/types/estudiantes"
import { ACADEMIC_YEARS, COURSE_LEVELS } from "./estudiantes-meta"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { ModalShell } from "./modal-shell"

export interface CourseForm {
  name: string
  level: string
  section: string
  academicYear: number
  description: string
}

interface CourseDialogProps {
  mode: "create" | "edit"
  initial?: Course
  onClose: () => void
  onSubmit: (data: CourseForm) => void
}

const req = <span className="text-danger">*</span>

/** Alta/edición de curso. El nombre se autosugiere desde nivel + sección. */
export function CourseDialog({ mode, initial, onClose, onSubmit }: CourseDialogProps) {
  const [name, setName] = useState(initial?.name ?? "")
  const [level, setLevel] = useState(initial?.level ?? "1° Medio")
  const [section, setSection] = useState(initial?.section ?? "A")
  const [academicYear, setYear] = useState(initial?.academicYear ?? 2026)
  const [description, setDesc] = useState(initial?.description ?? "")
  const [touchedName, setTouched] = useState(!!initial)
  const [showErr, setShowErr] = useState(false)

  // Autosugiere el nombre desde nivel + sección mientras no lo editen a mano.
  const onLevel = (next: string) => {
    setLevel(next)
    if (!touchedName) setName(`${next} ${section}`.trim())
  }
  const onSection = (next: string) => {
    setSection(next)
    if (!touchedName) setName(`${level} ${next}`.trim())
  }

  const valid = name.trim() && level && academicYear
  const submit = () => {
    if (!valid) return setShowErr(true)
    onSubmit({
      name: name.trim(),
      level,
      section: section.trim(),
      academicYear: Number(academicYear),
      description: description.trim(),
    })
  }

  return (
    <ModalShell onClose={onClose} label={mode === "edit" ? "Editar curso" : "Nuevo curso"}>
      <div className="flex items-start justify-between gap-3 px-[22px] pt-5">
        <div>
          <div className="text-[17px] font-semibold -tracking-[0.01em]">
            {mode === "edit" ? "Editar curso" : "Nuevo curso"}
          </div>
          <div className="mt-[3px] text-[13px] text-muted">
            {mode === "edit" ? initial?.name : "Define el curso del año académico."}
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

      <div className="flex flex-col gap-4 px-[22px] py-4">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="c-lvl">Nivel / grado {req}</FieldLabel>
            <Select id="c-lvl" value={level} onChange={(e) => onLevel(e.target.value)} wrapperClassName="w-full">
              {COURSE_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="c-sec">Sección</FieldLabel>
            <Input
              id="c-sec"
              value={section}
              maxLength={3}
              placeholder="A"
              onChange={(e) => onSection(e.target.value.toUpperCase())}
            />
            <FieldDescription>Letra del curso</FieldDescription>
          </Field>
        </div>
        <Field data-invalid={showErr && !name.trim()}>
          <FieldLabel htmlFor="c-nm">Nombre del curso {req}</FieldLabel>
          <Input
            id="c-nm"
            value={name}
            placeholder="1° Medio A"
            aria-invalid={showErr && !name.trim()}
            onChange={(e) => {
              setTouched(true)
              setName(e.target.value)
            }}
          />
          {showErr && !name.trim() ? (
            <FieldError>Requerido</FieldError>
          ) : (
            <FieldDescription>
              Se sugiere desde el nivel y la sección. Puedes editarlo.
            </FieldDescription>
          )}
        </Field>
        <Field>
          <FieldLabel htmlFor="c-yr">Año académico {req}</FieldLabel>
          <Select
            id="c-yr"
            value={academicYear}
            onChange={(e) => setYear(Number(e.target.value))}
            wrapperClassName="w-full"
          >
            {ACADEMIC_YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="c-ds">Descripción</FieldLabel>
          <Input
            id="c-ds"
            value={description}
            placeholder="Jefatura, plan, observaciones…"
            onChange={(e) => setDesc(e.target.value)}
          />
          <FieldDescription>Opcional. Jefatura, énfasis del curso, etc.</FieldDescription>
        </Field>
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
          <CheckIcon /> {mode === "edit" ? "Guardar cambios" : "Crear curso"}
        </Button>
      </div>
    </ModalShell>
  )
}
