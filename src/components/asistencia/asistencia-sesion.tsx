import { useState } from "react"
import {
  ArrowLeftIcon,
  CheckCheckIcon,
  LockIcon,
  SearchIcon,
} from "lucide-react"

import type { AsistenciaData, AttStatus, Marks } from "@/types/asistencia"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Counters, RosterRow, Stepper } from "./att-parts"
import { summ } from "./att-derive"

interface SesionProps {
  courseName: string
  data: AsistenciaData
  marks: Marks
  onSetMark: (n: number, v: AttStatus) => void
  onAllPresent: () => void
  onDiscard: () => void
  onClose: () => void
}

/** Parte 2: la toma de asistencia — hito ② Registro (sesión abierta). */
export function AsistenciaSesion({
  courseName,
  data,
  marks,
  onSetMark,
  onAllPresent,
  onDiscard,
  onClose,
}: SesionProps) {
  const [q, setQ] = useState("")
  const s = summ(marks, data.students.length)
  const flagged = s.atrasado + s.ausente + s.justificado
  const filtered = data.students.filter(
    (st) =>
      st.name.toLowerCase().includes(q.toLowerCase()) ||
      st.rut.toLowerCase().includes(q.toLowerCase())
  )

  return (
    <div className="mx-auto flex max-w-[1080px] flex-col gap-5 px-8 pt-6 pb-12">
      <button
        type="button"
        onClick={onDiscard}
        className="inline-flex items-center gap-1.5 self-start text-[13px] font-semibold text-muted transition-colors outline-none hover:text-primary"
      >
        <ArrowLeftIcon className="size-[15px]" /> Asistencia
      </button>

      <div className="flex flex-wrap items-center justify-between gap-[18px]">
        <div>
          <div className="mb-[7px] text-[11.5px] font-semibold tracking-[0.06em] text-muted uppercase">
            Toma de asistencia
          </div>
          <h1 className="text-2xl leading-tight font-semibold tracking-tight">
            {courseName}
          </h1>
          <p className="mt-[7px] text-sm text-muted">
            {data.today.dateLabel} · {data.course.block} · {data.course.room}
          </p>
        </div>
        <Stepper step="registro" />
      </div>

      <Alert variant="info" title="Sesión abierta">
        Todos parten como <b>presentes</b>. Marca los atrasos, ausencias y
        justificados. Los cambios se guardan recién al <b>cerrar y registrar</b> —
        antes de eso nada se envía.
      </Alert>

      <section className="flex flex-col overflow-hidden rounded-xl bg-background ring-1 ring-foreground/10">
        <div className="flex flex-wrap items-center gap-2.5 border-b border-border px-4 py-3">
          <Counters s={s} />
          <span className="flex-1" />
          <Button
            variant="outline"
            size="sm"
            onClick={onAllPresent}
            disabled={flagged === 0}
            title={flagged === 0 ? "Ya están todos presentes" : undefined}
          >
            <CheckCheckIcon /> Marcar todos presentes
          </Button>
          <div className="flex h-8 max-w-[230px] items-center gap-2 rounded-md border border-border bg-surface px-3 text-muted">
            <SearchIcon className="size-3.5 flex-none" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar estudiante o RUT…"
              className="w-full border-none bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted"
            />
          </div>
        </div>

        <div className="max-h-[460px] overflow-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="[&>th]:sticky [&>th]:top-0 [&>th]:z-[1] [&>th]:border-b [&>th]:border-border [&>th]:bg-surface [&>th]:px-3.5 [&>th]:py-2.5 [&>th]:text-left [&>th]:text-[11px] [&>th]:font-semibold [&>th]:tracking-[0.04em] [&>th]:whitespace-nowrap [&>th]:text-muted [&>th]:uppercase">
                <th className="w-10 text-center">#</th>
                <th>Estudiante</th>
                <th className="pr-3.5 text-right">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((st) => (
                <RosterRow
                  key={st.n}
                  student={st}
                  status={marks[st.n]}
                  onSet={onSetMark}
                />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-3.5 py-7 text-center text-muted">
                    Sin resultados para «{q}».
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* barra de acción fija — el hito de CIERRE */}
        <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-4 border-t border-border bg-background px-[18px] py-[13px] shadow-[0_-6px_16px_-12px_rgba(2,48,71,0.4)]">
          <span className="text-[13px] text-muted">
            <b className="text-foreground tabular-nums">{s.presente}</b> presentes ·{" "}
            <b className="text-foreground tabular-nums">{flagged}</b> con novedad de{" "}
            {s.total}
          </span>
          <div className="ml-auto flex items-center gap-2.5">
            <Button variant="ghost" onClick={onDiscard}>
              Descartar
            </Button>
            <Button onClick={onClose}>
              <LockIcon /> Cerrar y registrar asistencia
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
