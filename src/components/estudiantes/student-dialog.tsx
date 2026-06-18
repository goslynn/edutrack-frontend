import { useState } from "react"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  InfoIcon,
  PlusIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"

import type { Course, Guardian, Student } from "@/types/estudiantes"
import {
  RELATIONS,
  ageFrom,
  courseName,
  emailValid,
  formatRut,
  rutValid,
} from "./estudiantes-meta"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { ModalShell } from "./modal-shell"

export interface StudentForm {
  rut: string
  firstName: string
  lastName: string
  birthDate: string
  courseId: string
  guardians: Guardian[]
}

interface StudentDialogProps {
  mode: "create" | "edit"
  initial?: Student
  courses: Course[]
  onClose: () => void
  onSubmit: (data: StudentForm) => void
  loading?: boolean
  error?: string | null
}

const blankGuardian = (): Guardian => ({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  relationType: "PARENT",
})

const STEPS = ["Datos del alumno", "Apoderados", "Curso"]
const req = <span className="text-danger">*</span>

/** Alta/edición de alumno en 3 pasos: Datos → Apoderados → Curso. */
export function StudentDialog({ mode, initial, courses, onClose, onSubmit, loading, error }: StudentDialogProps) {
  const [step, setStep] = useState(1)
  const [rut, setRut] = useState(initial?.rut ?? "")
  const [firstName, setFirstName] = useState(initial?.firstName ?? "")
  const [lastName, setLastName] = useState(initial?.lastName ?? "")
  const [birthDate, setBirthDate] = useState(initial?.birthDate ?? "")
  const [courseId, setCourseId] = useState(initial?.courseId ?? "")
  const [guardians, setGuardians] = useState<Guardian[]>(
    initial ? initial.guardians.map((g) => ({ ...g })) : [blankGuardian()]
  )
  const [showErr, setShowErr] = useState(false)

  const activeCourses = courses.filter((c) => c.status === "ACTIVE")
  const past = !!birthDate && new Date(birthDate) < new Date()
  const step1Valid = rutValid(rut) && firstName.trim() && lastName.trim() && past
  const guardianOk = (g: Guardian) =>
    g.firstName.trim() && g.lastName.trim() && emailValid(g.email) && g.relationType
  const step2Valid = guardians.length >= 1 && guardians.every(guardianOk)
  const step3Valid = mode === "edit" ? true : !!courseId

  const setG = (i: number, patch: Partial<Guardian>) =>
    setGuardians((gs) => gs.map((g, j) => (j === i ? { ...g, ...patch } : g)))
  const addG = () => setGuardians((gs) => [...gs, blankGuardian()])
  const rmG = (i: number) => setGuardians((gs) => gs.filter((_, j) => j !== i))

  const next = () => {
    const ok = step === 1 ? step1Valid : step === 2 ? step2Valid : true
    if (!ok) return setShowErr(true)
    setShowErr(false)
    setStep((s) => s + 1)
  }
  const submit = () => {
    if (!step3Valid) return setShowErr(true)
    onSubmit({
      rut: formatRut(rut),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      birthDate,
      courseId,
      guardians: guardians.map((g) => ({
        ...g,
        firstName: g.firstName.trim(),
        lastName: g.lastName.trim(),
        email: g.email.trim(),
      })),
    })
  }

  const age = ageFrom(birthDate)

  return (
    <ModalShell size="lg" onClose={onClose} label={mode === "edit" ? "Editar alumno" : "Nuevo alumno"}>
      <div className="flex items-start justify-between gap-3 px-[22px] pt-5">
        <div>
          <div className="text-[17px] font-semibold -tracking-[0.01em]">
            {mode === "edit" ? "Editar alumno" : "Nuevo alumno"}
          </div>
          <div className="mt-[3px] text-[13px] text-muted">
            {mode === "edit"
              ? `${initial?.firstName} ${initial?.lastName}`
              : "Registra al alumno, su apoderado y el curso."}
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

      {/* stepper */}
      <div className="flex items-center gap-2.5 px-[22px] pt-4 pb-0.5">
        {STEPS.map((label, i) => {
          const n = i + 1
          const on = step === n
          const done = step > n
          return (
            <div key={label} className="flex items-center gap-2.5">
              {i > 0 && <span className="h-px w-3 min-w-3 flex-1 bg-border" />}
              <span
                className={cn(
                  "flex items-center gap-2 text-[13px] font-semibold whitespace-nowrap",
                  on ? "text-primary" : done ? "text-foreground" : "text-muted"
                )}
              >
                <span
                  className={cn(
                    "grid size-6 place-items-center rounded-full border text-[12.5px]",
                    on && "border-transparent bg-primary text-primary-foreground",
                    done && "border-transparent bg-primary-soft text-primary",
                    !on && !done && "border-border bg-surface"
                  )}
                >
                  {done ? <CheckIcon className="size-3.5" /> : n}
                </span>
                {label}
              </span>
            </div>
          )
        })}
      </div>

      <div className="overflow-auto px-[22px] py-4">
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <Field data-invalid={showErr && !rutValid(rut)}>
              <FieldLabel htmlFor="f-rut">RUT {req}</FieldLabel>
              <Input
                id="f-rut"
                value={rut}
                disabled={mode === "edit"}
                placeholder="12.345.678-5"
                aria-invalid={showErr && !rutValid(rut)}
                onChange={(e) => setRut(e.target.value)}
                onBlur={() => rut && setRut(formatRut(rut))}
              />
              {showErr && !rutValid(rut) ? (
                <FieldError>RUT inválido. Revisa el dígito verificador.</FieldError>
              ) : (
                <FieldDescription>
                  {mode === "edit"
                    ? "El RUT no se modifica."
                    : "Con dígito verificador. Se valida con módulo 11."}
                </FieldDescription>
              )}
            </Field>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <Field data-invalid={showErr && !firstName.trim()}>
                <FieldLabel htmlFor="f-fn">Nombres {req}</FieldLabel>
                <Input
                  id="f-fn"
                  value={firstName}
                  placeholder="Juan Andrés"
                  aria-invalid={showErr && !firstName.trim()}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                {showErr && !firstName.trim() && <FieldError>Requerido</FieldError>}
              </Field>
              <Field data-invalid={showErr && !lastName.trim()}>
                <FieldLabel htmlFor="f-ln">Apellidos {req}</FieldLabel>
                <Input
                  id="f-ln"
                  value={lastName}
                  placeholder="Pérez Soto"
                  aria-invalid={showErr && !lastName.trim()}
                  onChange={(e) => setLastName(e.target.value)}
                />
                {showErr && !lastName.trim() && <FieldError>Requerido</FieldError>}
              </Field>
            </div>
            <Field data-invalid={showErr && !past}>
              <FieldLabel htmlFor="f-bd">Fecha de nacimiento {req}</FieldLabel>
              <Input
                id="f-bd"
                type="date"
                value={birthDate}
                aria-invalid={showErr && !past}
                onChange={(e) => setBirthDate(e.target.value)}
              />
              {showErr && !past ? (
                <FieldError>Ingresa una fecha válida en el pasado.</FieldError>
              ) : (
                <FieldDescription>
                  {age != null && past ? `${age} años.` : "Debe ser una fecha pasada."}
                </FieldDescription>
              )}
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <p className="text-[12.5px] leading-snug text-muted text-pretty">
              Cada alumno necesita al menos un apoderado de contacto. El correo recibe la
              bienvenida y las notificaciones.
            </p>
            {guardians.map((g, i) => {
              const bad = showErr && !guardianOk(g)
              return (
                <div
                  key={i}
                  className={cn(
                    "flex flex-col gap-3 rounded-lg border bg-surface p-[15px]",
                    bad ? "border-danger" : "border-border"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11.5px] font-semibold tracking-[0.05em] text-muted uppercase">
                      Apoderado {i + 1}
                    </span>
                    {guardians.length > 1 && (
                      <button
                        type="button"
                        onClick={() => rmG(i)}
                        className="inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-xs font-semibold text-muted transition-colors outline-none hover:text-danger"
                      >
                        <Trash2Icon className="size-3.5" /> Quitar
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                    <Field data-invalid={showErr && !g.firstName.trim()}>
                      <FieldLabel htmlFor={`g-fn-${i}`}>Nombres {req}</FieldLabel>
                      <Input
                        id={`g-fn-${i}`}
                        value={g.firstName}
                        placeholder="María"
                        aria-invalid={showErr && !g.firstName.trim()}
                        onChange={(e) => setG(i, { firstName: e.target.value })}
                      />
                    </Field>
                    <Field data-invalid={showErr && !g.lastName.trim()}>
                      <FieldLabel htmlFor={`g-ln-${i}`}>Apellidos {req}</FieldLabel>
                      <Input
                        id={`g-ln-${i}`}
                        value={g.lastName}
                        placeholder="González"
                        aria-invalid={showErr && !g.lastName.trim()}
                        onChange={(e) => setG(i, { lastName: e.target.value })}
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                    <Field data-invalid={showErr && !emailValid(g.email)}>
                      <FieldLabel htmlFor={`g-em-${i}`}>Correo {req}</FieldLabel>
                      <Input
                        id={`g-em-${i}`}
                        type="email"
                        value={g.email}
                        placeholder="apoderado@mail.cl"
                        aria-invalid={showErr && !emailValid(g.email)}
                        onChange={(e) => setG(i, { email: e.target.value })}
                      />
                      {showErr && g.email && !emailValid(g.email) && (
                        <FieldError>Correo inválido</FieldError>
                      )}
                    </Field>
                    <Field>
                      <FieldLabel htmlFor={`g-ph-${i}`}>Teléfono</FieldLabel>
                      <Input
                        id={`g-ph-${i}`}
                        value={g.phone}
                        placeholder="+56 9 1234 5678"
                        onChange={(e) => setG(i, { phone: e.target.value })}
                      />
                      <FieldDescription>Opcional</FieldDescription>
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel htmlFor={`g-rt-${i}`}>Relación con el alumno {req}</FieldLabel>
                    <Select
                      id={`g-rt-${i}`}
                      value={g.relationType}
                      onChange={(e) => setG(i, { relationType: e.target.value as Guardian["relationType"] })}
                      wrapperClassName="w-full"
                    >
                      {Object.entries(RELATIONS).map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>
              )
            })}
            <button
              type="button"
              onClick={addG}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border-[1.5px] border-dashed border-border bg-transparent p-[11px] text-[13px] font-semibold text-primary transition-colors outline-none hover:border-primary hover:bg-primary-soft"
            >
              <PlusIcon className="size-4" /> Agregar otro apoderado
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            {mode === "edit" ? (
              <div className="flex items-start gap-3 rounded-lg border-[1.5px] border-dashed border-border px-4 py-3.5 text-muted">
                <InfoIcon className="mt-px size-[18px] flex-none text-primary" />
                <div>
                  <div className="text-[13.5px] font-semibold text-foreground">
                    Curso actual: {courseName(courses, courseId)}
                  </div>
                  <div className="mt-0.5 text-[12.5px] leading-normal">
                    El curso no se cambia al editar. Usa la acción «Trasladar» desde la
                    fila del alumno.
                  </div>
                </div>
              </div>
            ) : (
              <Field data-invalid={showErr && !courseId}>
                <FieldLabel htmlFor="f-course">Curso {req}</FieldLabel>
                <Select
                  id="f-course"
                  value={courseId}
                  aria-invalid={showErr && !courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  wrapperClassName="w-full"
                >
                  <option value="">Selecciona un curso…</option>
                  {activeCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} · {c.academicYear}
                    </option>
                  ))}
                </Select>
                {showErr && !courseId ? (
                  <FieldError>Selecciona un curso.</FieldError>
                ) : (
                  <FieldDescription>
                    El alumno quedará matriculado en este curso.
                  </FieldDescription>
                )}
              </Field>
            )}
            <div className="rounded-lg border border-border bg-surface px-4 py-3.5">
              <div className="mb-2 text-[11.5px] font-semibold tracking-[0.05em] text-muted uppercase">
                Resumen
              </div>
              <ReviewRow label="Alumno" value={`${firstName} ${lastName}`.trim() || "—"} />
              <ReviewRow label="RUT" value={rut ? formatRut(rut) : "—"} mono />
              <ReviewRow label="Apoderados" value={String(guardians.length)} />
              <ReviewRow label="Curso" value={courseName(courses, courseId)} />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border px-[22px] pt-3.5 pb-[18px]">
        {step === 1 ? (
          <button
            type="button"
            onClick={onClose}
            className="px-1 py-1.5 text-[13px] font-semibold text-muted transition-colors outline-none hover:text-foreground"
          >
            Cancelar
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setShowErr(false)
              setStep((s) => s - 1)
            }}
            className="inline-flex items-center gap-1 px-1 py-1.5 text-[13px] font-semibold text-muted transition-colors outline-none hover:text-foreground"
          >
            <ArrowLeftIcon className="size-[15px]" /> Atrás
          </button>
        )}
        <div className="flex items-center gap-3">
          {error && step === 3 && (
            <span className="text-[12.5px] text-danger">{error}</span>
          )}
          {step < 3 ? (
            <Button onClick={next}>
              Continuar <ArrowRightIcon />
            </Button>
          ) : (
            <Button disabled={loading} onClick={submit}>
              <CheckIcon /> {mode === "edit" ? "Guardar cambios" : "Matricular alumno"}
            </Button>
          )}
        </div>
      </div>
    </ModalShell>
  )
}

function ReviewRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-[5px] text-[13.5px]">
      <span className="text-muted">{label}</span>
      <b className={mono ? "font-mono tabular-nums" : ""}>{value}</b>
    </div>
  )
}
