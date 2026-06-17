import { useState } from "react"
import { ArrowRightLeftIcon, XIcon } from "lucide-react"

import type { Course, Student } from "@/types/estudiantes"
import { courseName } from "./estudiantes-meta"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Select } from "@/components/ui/select"
import { ModalShell } from "./modal-shell"

interface TransferDialogProps {
  student: Student
  courses: Course[]
  onClose: () => void
  onSubmit: (destId: string) => void
}

/** Traslado de un alumno a otro curso activo (→ estado TRANSFERRED). */
export function TransferDialog({ student, courses, onClose, onSubmit }: TransferDialogProps) {
  const [dest, setDest] = useState("")
  const options = courses.filter((c) => c.status === "ACTIVE" && c.id !== student.courseId)

  return (
    <ModalShell onClose={onClose} label="Trasladar alumno">
      <div className="flex items-start justify-between gap-3 px-[22px] pt-5">
        <div>
          <div className="text-[17px] font-semibold -tracking-[0.01em]">Trasladar alumno</div>
          <div className="mt-[3px] text-[13px] text-muted">
            {student.firstName} {student.lastName}
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
        <div className="flex items-center justify-between gap-3 pt-0.5 pb-1.5 text-[13.5px]">
          <span className="text-muted">Curso actual</span>
          <b>{courseName(courses, student.courseId)}</b>
        </div>
        <Field>
          <FieldLabel htmlFor="t-dest">Curso destino <span className="text-danger">*</span></FieldLabel>
          <Select
            id="t-dest"
            value={dest}
            onChange={(e) => setDest(e.target.value)}
            wrapperClassName="w-full"
          >
            <option value="">Selecciona un curso…</option>
            {options.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} · {c.academicYear}
              </option>
            ))}
          </Select>
          <FieldDescription>
            El alumno conserva su historial. Su estado pasará a «Trasladado».
          </FieldDescription>
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
        <Button disabled={!dest} onClick={() => onSubmit(dest)}>
          <ArrowRightLeftIcon /> Trasladar
        </Button>
      </div>
    </ModalShell>
  )
}
