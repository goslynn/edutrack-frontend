import {
  CalendarCheck2Icon,
  CalendarClockIcon,
  ClipboardCheckIcon,
  DownloadIcon,
  EyeIcon,
  LockIcon,
  TrendingUpIcon,
} from "lucide-react"

import type { AsistenciaData, AsistenciaPerms, Marks } from "@/types/asistencia"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MiniBar } from "./att-parts"
import { statusMap, summ, summarize } from "./att-derive"
import type { RecordView } from "./asistencia-screen"

interface ResumenProps {
  perms: AsistenciaPerms
  courseName: string
  data: AsistenciaData
  registered: { marks: Marks; time: string } | null
  onStart: () => void
  onView: (rec: RecordView) => void
}

const DOTS = [
  { k: "presente", label: "Presente", c: "bg-success" },
  { k: "atrasado", label: "Atrasado", c: "bg-warning" },
  { k: "justificado", label: "Justificado", c: "bg-primary" },
  { k: "ausente", label: "Ausente", c: "bg-danger" },
]

/** Parte 1: resumen — clase de hoy + asistencia de los últimos días. */
export function AsistenciaResumen({
  perms,
  courseName,
  data,
  registered,
  onStart,
  onView,
}: ResumenProps) {
  const taken = !!registered
  const ms = data.monthStats
  const total = data.students.length

  // Filas: registro de hoy (si se cerró en esta sesión) + historial inmutable.
  const rows = [
    ...(registered
      ? [
          {
            id: "today",
            dateLabel: data.today.dateLabel,
            dow: "Hoy",
            time: registered.time,
            by: "M. Rojas",
            isToday: true,
            marks: registered.marks,
            summary: summ(registered.marks, total),
          },
        ]
      : []),
    ...data.history.map((h) => ({
      id: h.id,
      dateLabel: h.dateLabel,
      dow: h.dow,
      time: h.time,
      by: h.by,
      isToday: false,
      marks: statusMap(h, data.students),
      summary: summarize(h, total),
    })),
  ]

  return (
    <div className="mx-auto flex max-w-[1080px] flex-col gap-5 px-8 pt-6 pb-12">
      {/* encabezado */}
      <div className="flex flex-wrap items-end justify-between gap-[18px]">
        <div>
          <div className="mb-[7px] text-[11.5px] font-semibold tracking-[0.06em] text-muted uppercase">
            Asistencia
          </div>
          <h1 className="text-2xl leading-tight font-semibold tracking-tight">
            {courseName}
          </h1>
          <p className="mt-[7px] text-sm text-muted">
            {data.course.subject} · {data.course.room} · {data.students.length} estudiantes
          </p>
        </div>
        {perms.export !== "hidden" && (
          <Button
            variant="outline"
            size="sm"
            disabled={perms.export === "disabled"}
            title={
              perms.export === "disabled" ? "Tu perfil no permite exportar" : undefined
            }
          >
            <DownloadIcon /> Exportar
          </Button>
        )}
      </div>

      {/* HERO — clase de hoy */}
      <section
        className={cn(
          "relative flex flex-wrap items-center justify-between gap-6 overflow-hidden rounded-xl bg-background px-6 py-[22px] ring-1 ring-foreground/10",
          "before:absolute before:inset-y-0 before:left-0 before:w-1",
          taken ? "before:bg-success" : "before:bg-warning"
        )}
      >
        <div className="flex min-w-0 items-start gap-4">
          <span
            className={cn(
              "grid size-[52px] flex-none place-items-center rounded-[14px]",
              taken ? "bg-success-soft text-success" : "bg-warning-soft text-warning-strong"
            )}
          >
            {taken ? (
              <CalendarCheck2Icon className="size-6" />
            ) : (
              <CalendarClockIcon className="size-6" />
            )}
          </span>
          <div>
            <div className="text-[11px] font-semibold tracking-[0.06em] text-muted uppercase">
              Clase de hoy
            </div>
            <div className="mt-[3px] text-xl font-semibold -tracking-[0.01em]">
              {data.today.dateLabel}
            </div>
            <div className="mt-[3px] text-[13px] text-muted">
              {data.course.block} · {data.course.room}
            </div>
            <div className="mt-[11px]">
              {taken ? (
                <Badge variant="success" dot>
                  Asistencia registrada · {registered!.time}
                </Badge>
              ) : (
                <Badge variant="warning" dot>
                  Asistencia pendiente
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-none flex-col items-end gap-[9px]">
          {taken ? (
            <>
              <div className="inline-flex items-center gap-1.5 text-xs text-muted">
                <LockIcon className="size-3.5" /> Registro cerrado · no editable
              </div>
              {perms.view === "enabled" && (
                <Button
                  variant="outline"
                  onClick={() =>
                    onView({
                      title: data.today.dateLabel,
                      sub: `${courseName} · ${data.course.subject}`,
                      by: "M. Rojas",
                      time: registered!.time,
                      marks: registered!.marks,
                      summary: summ(registered!.marks, total),
                    })
                  }
                >
                  <EyeIcon /> Ver registro de hoy
                </Button>
              )}
            </>
          ) : perms.take === "enabled" ? (
            <Button size="lg" onClick={onStart}>
              <ClipboardCheckIcon /> Tomar asistencia ahora
            </Button>
          ) : perms.take === "disabled" ? (
            <div className="flex flex-col items-end gap-[7px]">
              <Button size="lg" disabled>
                <LockIcon /> Tomar asistencia ahora
              </Button>
              <span className="max-w-[240px] text-right text-xs text-balance text-muted">
                No tienes permiso para registrar la asistencia de esta clase.
              </span>
            </div>
          ) : (
            <span className="inline-flex max-w-[320px] items-center gap-[7px] text-right text-[13px] text-balance text-muted">
              <EyeIcon className="size-[15px] flex-none" /> Perfil de consulta — la
              asistencia se muestra como registro de solo lectura.
            </span>
          )}
        </div>
      </section>

      {/* franja de stats del mes */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-background px-[18px] py-4 ring-1 ring-foreground/10">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[12.5px] font-medium text-muted">
              Asistencia del mes
            </span>
            <span className="inline-flex items-center gap-[3px] font-mono text-xs font-semibold text-success">
              <TrendingUpIcon className="size-[13px]" />
              {ms.deltaPct}
            </span>
          </div>
          <div className="mt-2 text-[26px] font-semibold -tracking-[0.02em] tabular-nums">
            {ms.pct}%
          </div>
        </div>
        <div className="rounded-xl bg-background px-[18px] py-4 ring-1 ring-foreground/10">
          <span className="text-[12.5px] font-medium text-muted">
            Clases registradas
          </span>
          <div className="mt-2 text-[26px] font-semibold -tracking-[0.02em] tabular-nums">
            {ms.sessions}
          </div>
          <div className="text-xs text-muted">este mes</div>
        </div>
        <div className="rounded-xl bg-background px-[18px] py-4 ring-1 ring-foreground/10">
          <span className="text-[12.5px] font-medium text-muted">
            Atrasos por clase
          </span>
          <div className="mt-2 text-[26px] font-semibold -tracking-[0.02em] tabular-nums">
            {String(ms.lateAvg).replace(".", ",")}
          </div>
          <div className="text-xs text-muted">promedio</div>
        </div>
      </div>

      {/* últimos días */}
      <section className="overflow-hidden rounded-xl bg-background ring-1 ring-foreground/10">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-[18px] py-[15px]">
          <div>
            <span className="text-[14.5px] font-semibold">Últimos días</span>
            <span className="text-[12.5px] text-muted">
              {" "}
              · registros cerrados, solo lectura
            </span>
          </div>
          <div className="flex flex-wrap gap-3.5">
            {DOTS.map((dt) => (
              <span
                key={dt.k}
                className="inline-flex items-center gap-1.5 text-[11.5px] text-muted"
              >
                <i className={cn("size-2 rounded-full", dt.c)} />
                {dt.label}
              </span>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="[&>th]:border-b [&>th]:border-border [&>th]:bg-surface [&>th]:px-3.5 [&>th]:py-[11px] [&>th]:text-left [&>th]:text-[11px] [&>th]:font-semibold [&>th]:tracking-[0.04em] [&>th]:whitespace-nowrap [&>th]:text-muted [&>th]:uppercase">
                <th>Fecha</th>
                <th className="text-center">Pres.</th>
                <th className="text-center">Atr.</th>
                <th className="text-center">Aus.</th>
                <th className="text-center">Just.</th>
                <th className="hidden md:table-cell">Distribución</th>
                <th className="text-center">Asist.</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className={cn(
                    "border-b border-border last:border-b-0 [&>td]:px-3.5 [&>td]:py-[11px] [&>td]:align-middle",
                    r.isToday ? "bg-primary/5" : "hover:bg-surface/60"
                  )}
                >
                  <td>
                    <div className="flex items-center gap-2.5">
                      <span className="w-[30px] text-[11px] font-semibold text-muted uppercase">
                        {r.dow}
                      </span>
                      <span className="font-medium whitespace-nowrap">
                        {r.dateLabel}
                      </span>
                      {r.isToday && (
                        <span className="rounded-full bg-primary-soft px-1.5 py-px text-[10px] font-bold tracking-[0.04em] text-primary uppercase">
                          Hoy
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="text-center font-mono tabular-nums">
                    {r.summary.presente}
                  </td>
                  <td className="text-center font-mono text-warning-strong tabular-nums">
                    {r.summary.atrasado || "—"}
                  </td>
                  <td className="text-center font-mono text-danger tabular-nums">
                    {r.summary.ausente || "—"}
                  </td>
                  <td className="text-center font-mono text-primary tabular-nums">
                    {r.summary.justificado || "—"}
                  </td>
                  <td className="hidden w-[150px] md:table-cell">
                    <MiniBar s={r.summary} />
                  </td>
                  <td className="text-center font-mono font-semibold tabular-nums">
                    {r.summary.pct}%
                  </td>
                  <td className="whitespace-nowrap">
                    <Badge variant="neutral">
                      <LockIcon className="size-[11px]" /> Registrada
                    </Badge>
                  </td>
                  <td className="text-right">
                    {perms.view === "enabled" && (
                      <button
                        type="button"
                        onClick={() =>
                          onView({
                            title: r.dateLabel,
                            sub: `${courseName} · ${data.course.subject}`,
                            by: r.by,
                            time: r.time,
                            marks: r.marks,
                            summary: r.summary,
                          })
                        }
                        className="rounded-sm px-2 py-[5px] text-[13px] font-semibold text-primary transition-colors outline-none hover:bg-primary-soft"
                      >
                        Ver
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
