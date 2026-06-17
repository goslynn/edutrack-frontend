import { ArrowLeftIcon, EyeIcon } from "lucide-react"

import type { AsistenciaData, Marks } from "@/types/asistencia"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Counters, MiniBar, Stepper } from "./att-parts"
import { summ } from "./att-derive"
import type { RecordView } from "./asistencia-screen"

interface RegistradaProps {
  courseName: string
  data: AsistenciaData
  registered: { marks: Marks; time: string }
  onView: (rec: RecordView) => void
  onBack: () => void
}

/** Hito ③ Cierre — pantalla de confirmación tras registrar la asistencia. */
export function AsistenciaRegistrada({
  courseName,
  data,
  registered,
  onView,
  onBack,
}: RegistradaProps) {
  const s = summ(registered.marks, data.students.length)
  return (
    <div className="mx-auto flex max-w-[1080px] flex-col gap-5 px-8 pt-6 pb-12">
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
        <Stepper step="cierre" />
      </div>

      <Alert variant="success" title="Asistencia registrada">
        La asistencia de hoy quedó cerrada a las {registered.time} y enviada al libro
        de clases. Por regla del sistema, un registro cerrado <b>no puede
        modificarse</b> — solo consultarse.
      </Alert>

      <section className="flex flex-col items-center gap-4 rounded-xl bg-background p-[26px] text-center ring-1 ring-foreground/10">
        <Counters s={s} />
        <div className="flex flex-col items-center gap-0.5">
          <div className="text-[44px] leading-none font-semibold -tracking-[0.02em] text-success tabular-nums">
            {s.pct}%
          </div>
          <div className="text-[13px] text-muted">
            de asistencia · {s.presente + s.atrasado} de {s.total} estuvieron en clase
          </div>
        </div>
        <MiniBar s={s} className="w-full max-w-[420px]" />
        <div className="mt-1 flex flex-wrap justify-center gap-2.5">
          <Button onClick={onBack}>
            <ArrowLeftIcon /> Volver al resumen
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              onView({
                title: data.today.dateLabel,
                sub: `${courseName} · ${data.course.subject}`,
                by: "M. Rojas",
                time: registered.time,
                marks: registered.marks,
                summary: s,
              })
            }
          >
            <EyeIcon /> Ver registro
          </Button>
        </div>
      </section>
    </div>
  )
}
