import { InfoIcon, LockIcon } from "lucide-react"

import type { Student } from "@/types/asistencia"
import { Button } from "@/components/ui/button"
import { Modal } from "./att-modal"
import { Counters, RosterRow } from "./att-parts"
import type { RecordView } from "./asistencia-screen"

/** Visor de un registro cerrado, en modo solo lectura (modal). */
export function RecordViewer({
  rec,
  students,
  onClose,
}: {
  rec: RecordView
  students: Student[]
  onClose: () => void
}) {
  return (
    <Modal
      wide
      icon={LockIcon}
      tone="neutral"
      title={rec.title}
      sub={`${rec.sub} · cerrada ${rec.time} por ${rec.by}`}
      onClose={onClose}
      foot={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted">
            <InfoIcon className="size-3.5" /> Registro cerrado · solo lectura
          </span>
          <Button onClick={onClose}>Cerrar</Button>
        </div>
      }
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <Counters s={rec.summary} />
        <span className="text-[13px] font-semibold">{rec.summary.pct}% asistencia</span>
      </div>
      <div className="max-h-[50vh] overflow-auto rounded-lg border border-border">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="[&>th]:sticky [&>th]:top-0 [&>th]:z-[1] [&>th]:border-b [&>th]:border-border [&>th]:bg-surface [&>th]:px-3.5 [&>th]:py-2.5 [&>th]:text-left [&>th]:text-[11px] [&>th]:font-semibold [&>th]:tracking-[0.04em] [&>th]:whitespace-nowrap [&>th]:text-muted [&>th]:uppercase">
              <th className="w-10 text-center">#</th>
              <th>Estudiante</th>
              <th className="pr-3.5 text-right">Estado</th>
            </tr>
          </thead>
          <tbody>
            {students.map((st) => (
              <RosterRow key={st.n} student={st} status={rec.marks[st.n]} readOnly />
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  )
}
