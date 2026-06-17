import type { AttendanceDay } from "@/types/dashboard"
import { useChartWidth } from "./use-chart-width"

interface AttendanceBarsProps {
  data: AttendanceDay[]
  target?: number
  height?: number
}

/** Barras verticales: asistencia semanal (% por día) con línea de meta. */
export function AttendanceBars({ data, target = 90, height = 168 }: AttendanceBarsProps) {
  const { ref, width } = useChartWidth()
  const padL = 14
  const padR = 14
  const padT = 18
  const padB = 26
  const iw = Math.max(width - padL - padR, 10)
  const ih = height - padT - padB
  const gap = 16
  const bw = (iw - gap * (data.length - 1)) / data.length
  const y = (v: number) => padT + ih - (v / 100) * ih

  return (
    <div ref={ref} className="w-full min-w-0" style={{ minHeight: height }}>
      <svg width={width} height={height} role="img" aria-label="Asistencia semanal">
        <line
          x1={padL}
          x2={padL + iw}
          y1={y(target)}
          y2={y(target)}
          stroke="var(--color-muted)"
          strokeWidth="1"
          strokeDasharray="3 3"
          opacity="0.6"
        />
        <text x={padL} y={y(target) - 5} textAnchor="start" fontSize="10" fontFamily="var(--font-mono)" fill="var(--color-muted)">
          meta {target}%
        </text>
        {data.map((d, i) => {
          const bh = (d.value / 100) * ih
          const bx = padL + i * (bw + gap)
          const by = padT + ih - bh
          const below = d.value < target
          return (
            <g key={d.label}>
              <rect x={bx} y={padT} width={bw} height={ih} rx="5" fill="var(--color-surface)" />
              <rect
                x={bx}
                y={by}
                width={bw}
                height={bh}
                rx="5"
                fill={
                  below
                    ? "color-mix(in srgb, var(--color-primary) 38%, var(--color-background))"
                    : "var(--color-primary)"
                }
              />
              <text x={bx + bw / 2} y={by - 6} textAnchor="middle" fontSize="11.5" fontWeight="600" fontFamily="var(--font-mono)" fill="var(--color-foreground)">
                {d.value}
              </text>
              <text x={bx + bw / 2} y={height - 8} textAnchor="middle" fontSize="11" fontFamily="var(--font-sans)" fill="var(--color-muted)">
                {d.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
