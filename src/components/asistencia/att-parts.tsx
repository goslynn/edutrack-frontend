import { CheckIcon } from "lucide-react"

import type { AttStatus, AttSummary, Student } from "@/types/asistencia"
import { cn } from "@/lib/utils"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ATT_OPTS, DOT_BG, ON_BG, STATUS } from "./att-status"

/** Chips con los conteos de la sesión. */
export function Counters({ s }: { s: AttSummary }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="success" dot>{s.presente} presentes</Badge>
      <Badge variant="warning" dot>{s.atrasado} atrasados</Badge>
      <Badge variant="danger" dot>{s.ausente} ausentes</Badge>
      <Badge variant="primary" dot>{s.justificado} justificados</Badge>
    </div>
  )
}

/** Barra apilada presente·atrasado·justificado·ausente. */
export function MiniBar({ s, className }: { s: AttSummary; className?: string }) {
  const order: AttStatus[] = ["presente", "atrasado", "justificado", "ausente"]
  return (
    <div
      className={cn(
        "flex h-[7px] min-w-[120px] overflow-hidden rounded-full bg-border",
        className
      )}
      title={`${s.presente} presentes · ${s.atrasado} atrasados · ${s.justificado} justificados · ${s.ausente} ausentes`}
    >
      {order.map((k) =>
        s[k] > 0 ? (
          <span key={k} className={cn("block", DOT_BG[k])} style={{ flex: s[k] }} />
        ) : null
      )}
    </div>
  )
}

const STEPS: { id: string; n: number; label: string }[] = [
  { id: "inicio", n: 1, label: "Inicio" },
  { id: "registro", n: 2, label: "Registro" },
  { id: "cierre", n: 3, label: "Cierre" },
]
const ORDER: Record<string, number> = { inicio: 0, registro: 1, cierre: 2 }

/** Stepper de los tres hitos del flujo (① Inicio · ② Registro · ③ Cierre). */
export function Stepper({ step }: { step: "inicio" | "registro" | "cierre" }) {
  const cur = ORDER[step]
  return (
    <div className="flex flex-none items-center gap-3">
      {STEPS.map((s, i) => {
        const done = i < cur || (step === "cierre" && i <= cur)
        const on = i === cur && step !== "cierre"
        return (
          <div key={s.id} className="flex items-center gap-3">
            <div
              className={cn(
                "flex items-center gap-2 text-[13px] font-semibold whitespace-nowrap",
                on ? "text-primary" : done ? "text-foreground" : "text-muted"
              )}
            >
              <span
                className={cn(
                  "grid size-6 place-items-center rounded-full border border-border bg-surface font-mono text-[12.5px]",
                  on && "border-transparent bg-primary text-primary-foreground",
                  done && "border-transparent bg-primary-soft text-primary"
                )}
              >
                {done ? <CheckIcon className="size-[13px]" /> : s.n}
              </span>
              {s.label}
            </div>
            {i < STEPS.length - 1 && <span className="h-px w-7 bg-border" />}
          </div>
        )
      })}
    </div>
  )
}

interface RosterRowProps {
  student: Student
  status: AttStatus
  onSet?: (n: number, v: AttStatus) => void
  readOnly?: boolean
}

/** Fila de la nómina: editable (segmented de 4 estados) o solo lectura (badge). */
export function RosterRow({ student, status, onSet, readOnly }: RosterRowProps) {
  return (
    <tr className="border-b border-border last:border-b-0 hover:bg-surface/55">
      <td className="w-10 py-2 text-center font-mono text-xs text-muted">{student.n}</td>
      <td className="py-2 pr-3.5">
        <div className="flex items-center gap-2.5">
          <Avatar name={student.first + " " + student.last} size="sm" />
          <div>
            <b className="font-medium">{student.name}</b>
            <div className="font-mono text-[11.5px] text-muted">{student.rut}</div>
          </div>
        </div>
      </td>
      <td className="py-2 pr-3.5 text-right">
        {readOnly ? (
          <Badge variant={STATUS[status].badge} dot className="float-right">
            {STATUS[status].label}
          </Badge>
        ) : (
          <span
            role="radiogroup"
            aria-label={"Estado de " + student.name}
            className="inline-flex overflow-hidden rounded-md border border-border"
          >
            {ATT_OPTS.map((o) => (
              <AttButton
                key={o.v}
                option={o}
                active={status === o.v}
                onClick={() => onSet?.(student.n, o.v)}
              />
            ))}
          </span>
        )}
      </td>
    </tr>
  )
}

function AttButton({
  option,
  active,
  onClick,
}: {
  option: { v: AttStatus; label: string }
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={cn(
        "border-r border-border px-3 py-[5px] text-xs font-medium whitespace-nowrap transition-colors outline-none last:border-r-0",
        active
          ? ON_BG[option.v]
          : "bg-background text-muted hover:bg-surface hover:text-foreground"
      )}
    >
      {option.label}
    </button>
  )
}
