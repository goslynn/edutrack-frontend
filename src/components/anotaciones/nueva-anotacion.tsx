import { useState } from "react"
import {
  BellRingIcon,
  CheckIcon,
  ShieldCheckIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  SquarePenIcon,
} from "lucide-react"

import type {
  Annotation,
  AnnotationType,
  RosterStudent,
  Teacher,
} from "@/types/anotaciones"
import { cn } from "@/lib/utils"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { MAX_CONTENT } from "./anno-meta"

interface NuevaAnotacionProps {
  roster: RosterStudent[]
  /** Fecha por defecto / tope de la anotación (ISO). */
  today: string
  /** Docente autenticado que quedará como autor. */
  currentTeacher: Teacher
  onSubmit: (a: Annotation) => void
}

const reqMark = <span className="text-danger">*</span>

/** Panel derecho: formulario para registrar una anotación nueva. */
export function NuevaAnotacion({
  roster,
  today,
  currentTeacher,
  onSubmit,
}: NuevaAnotacionProps) {
  const [studentId, setStudentId] = useState("")
  const [type, setType] = useState<AnnotationType | null>(null)
  const [content, setContent] = useState("")
  const [date, setDate] = useState(today)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  const over = content.length > MAX_CONTENT

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setOk(null)
    // Reglas de dominio del Annotation MS, validadas en la UI.
    if (!studentId) return setError("Selecciona el estudiante anotado.")
    if (!type) return setError("La anotación debe indicar un tipo (BE-ANN-001).")
    if (!content.trim()) return setError("Escribe el texto de la anotación.")
    if (over) return setError("El texto supera los 1000 caracteres permitidos.")
    setError(null)

    const student = roster.find((s) => s.id === studentId)
    if (!student) return
    onSubmit({
      id: "new-" + Date.now(),
      studentId,
      student: student.name,
      author: currentTeacher.name,
      type,
      content: content.trim(),
      date,
      guardianNotified: type === "NEGATIVE",
    })
    setOk(
      type === "NEGATIVE"
        ? "Anotación registrada — el apoderado será notificado."
        : "Anotación registrada."
    )
    setContent("")
    setType(null)
    setStudentId("")
    setDate(today)
  }

  const labelCls =
    "inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-foreground"
  const dateCls =
    "h-9 appearance-none rounded-md border border-border bg-background px-[11px] text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

  return (
    <section className="flex min-w-0 flex-col overflow-hidden rounded-xl bg-background ring-1 ring-foreground/10 lg:sticky lg:top-[18px]">
      <div className="px-[18px] py-[15px]">
        <span className="inline-flex items-center gap-2 text-[14.5px] font-semibold">
          <SquarePenIcon className="size-[17px]" /> Nueva anotación
        </span>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-[15px] px-[18px] pt-1 pb-[18px]">
        {ok && (
          <Alert variant="success" title="Listo">
            {ok}
          </Alert>
        )}
        {error && (
          <Alert variant="danger" title="Revisa el formulario">
            {error}
          </Alert>
        )}

        <div className="flex flex-col gap-1.5">
          <label className={labelCls} htmlFor="anno-student">
            Estudiante {reqMark}
          </label>
          <Select
            id="anno-student"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            wrapperClassName="w-full"
          >
            <option value="" disabled>
              Selecciona un estudiante…
            </option>
            {roster.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className={labelCls}>Tipo {reqMark}</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              aria-pressed={type === "POSITIVE"}
              onClick={() => setType("POSITIVE")}
              className={cn(
                "inline-flex items-center justify-center gap-1.5 rounded-md border px-2.5 py-[9px] text-[13px] font-semibold transition-colors outline-none",
                type === "POSITIVE"
                  ? "border-success bg-success-soft text-success"
                  : "border-border bg-background text-muted hover:text-foreground"
              )}
            >
              <ThumbsUpIcon className="size-4" /> Positiva
            </button>
            <button
              type="button"
              aria-pressed={type === "NEGATIVE"}
              onClick={() => setType("NEGATIVE")}
              className={cn(
                "inline-flex items-center justify-center gap-1.5 rounded-md border px-2.5 py-[9px] text-[13px] font-semibold transition-colors outline-none",
                type === "NEGATIVE"
                  ? "border-danger bg-danger-soft text-danger"
                  : "border-border bg-background text-muted hover:text-foreground"
              )}
            >
              <ThumbsDownIcon className="size-4" /> Negativa
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelCls} htmlFor="anno-text">
            Anotación {reqMark}
          </label>
          <textarea
            id="anno-text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={MAX_CONTENT + 200}
            placeholder="Describe la conducta o el reconocimiento, de forma objetiva…"
            className={cn(
              "min-h-[92px] w-full resize-y rounded-md border bg-background px-[11px] py-2.5 text-sm leading-normal text-foreground outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
              over ? "border-danger" : "border-border focus-visible:border-ring"
            )}
          />
          <span
            className={cn(
              "self-end font-mono text-[11.5px]",
              over ? "text-danger" : "text-muted"
            )}
          >
            {content.length}/{MAX_CONTENT}
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelCls} htmlFor="anno-date">
            Fecha
          </label>
          <input
            id="anno-date"
            type="date"
            value={date}
            max={today}
            onChange={(e) => setDate(e.target.value)}
            className={dateCls}
          />
          <span className="text-[11.5px] text-muted">
            A qué día refiere la anotación. Por defecto, hoy.
          </span>
        </div>

        {type === "NEGATIVE" && (
          <div className="flex items-start gap-2.5 rounded-md bg-info/10 px-3 py-2.5 text-[12.5px] leading-snug text-info">
            <BellRingIcon className="mt-px size-[15px] flex-none" />
            <span>
              Al registrar una anotación <strong>negativa</strong>, se notificará
              automáticamente al apoderado del estudiante.
            </span>
          </div>
        )}

        <Button type="submit">
          <CheckIcon /> Registrar anotación
        </Button>
        <span className="inline-flex items-center gap-1.5 text-[11.5px] leading-snug text-muted">
          <ShieldCheckIcon className="size-[13px] flex-none" /> Quedará registrada a tu
          nombre — {currentTeacher.name}.
        </span>
      </form>
    </section>
  )
}
