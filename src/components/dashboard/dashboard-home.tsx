import { CalendarCheckIcon, DownloadIcon } from "lucide-react"

import type { DashboardData, SectionId } from "@/types/dashboard"
import { Button } from "@/components/ui/button"
import { Tabs } from "@/components/ui/tabs"
import { AttendanceBars } from "./charts/attendance-bars"
import { GradeHistogram } from "./charts/grade-histogram"
import { TrendLine } from "./charts/trend-line"
import { DashboardPanel } from "./dashboard-panel"
import { ShortcutsPanel } from "./shortcuts-panel"
import { StatCard } from "./stat-card"

export type DashboardLayout = "equilibrado" | "accesos" | "analisis"

interface DashboardHomeProps {
  data: DashboardData
  layout: DashboardLayout
  onLayoutChange: (layout: DashboardLayout) => void
  onGo: (target: SectionId) => void
}

const LAYOUT_TABS = [
  { value: "equilibrado", label: "Equilibrado" },
  { value: "accesos", label: "Accesos" },
  { value: "analisis", label: "Análisis" },
]

/** Home post-login (Inicio): encabezado, stats, visualizaciones y accesos. */
export function DashboardHome({
  data,
  layout,
  onLayoutChange,
  onGo,
}: DashboardHomeProps) {
  const head = (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="mb-[7px] text-[11.5px] font-semibold tracking-[0.06em] text-muted uppercase">
          {data.today.greeting}
        </div>
        <h1 className="text-2xl leading-tight font-semibold tracking-tight">
          {data.today.dateLabel}
        </h1>
        <p className="mt-[7px] text-sm text-muted">{data.today.summary}</p>
      </div>
      <div className="flex flex-col items-end gap-3">
        <div className="flex items-center gap-2">
          <span className="hidden text-[11px] font-semibold tracking-[0.06em] text-muted uppercase sm:inline">
            Vista
          </span>
          <Tabs
            tabs={LAYOUT_TABS}
            value={layout}
            onValueChange={(value) => onLayoutChange(value as DashboardLayout)}
          />
        </div>
        <div className="flex gap-2.5">
          <Button variant="outline" size="sm">
            <DownloadIcon /> Exportar
          </Button>
          <Button size="sm" onClick={() => onGo("asistencia")}>
            <CalendarCheckIcon /> Pasar asistencia
          </Button>
        </div>
      </div>
    </div>
  )

  const stats = (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {data.stats.map((stat) => (
        <StatCard key={stat.id} stat={stat} />
      ))}
    </div>
  )

  const trendPanel = (
    <DashboardPanel title="Promedio del curso" hint="por unidad · escala 1,0–7,0">
      <TrendLine data={data.avgTrend} />
    </DashboardPanel>
  )
  const distPanel = (
    <DashboardPanel title="Distribución de notas" hint="estudiantes por rango">
      <GradeHistogram data={data.gradeDist} />
    </DashboardPanel>
  )
  const attPanel = (
    <DashboardPanel title="Asistencia semanal" hint="% presentes por día">
      <AttendanceBars data={data.attendanceWeek} />
    </DashboardPanel>
  )
  const charts3 = (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {trendPanel}
      {distPanel}
      {attPanel}
    </div>
  )
  const shortcuts = (hero: boolean) => (
    <ShortcutsPanel
      shortcuts={data.shortcuts}
      quickActions={data.quickActions}
      onGo={onGo}
      hero={hero}
    />
  )

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-[22px] px-8 pt-7 pb-10">
      {head}

      {layout === "accesos" && (
        <>
          {shortcuts(true)}
          {stats}
          {charts3}
        </>
      )}

      {layout === "analisis" && (
        <>
          {stats}
          {charts3}
          {shortcuts(true)}
        </>
      )}

      {layout === "equilibrado" && (
        <>
          {stats}
          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1.45fr_1fr]">
            {trendPanel}
            {shortcuts(false)}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {distPanel}
            {attPanel}
          </div>
        </>
      )}
    </div>
  )
}
