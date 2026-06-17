import type { GradeBucket, GradeTone } from "@/types/dashboard"
import { useChartWidth } from "./use-chart-width"

interface GradeHistogramProps {
  data: GradeBucket[]
  height?: number
}

const TONE: Record<GradeTone, string> = {
  low: "var(--color-danger)",
  mid: "var(--color-warning-strong)",
  high: "var(--color-primary)",
}

/** Histograma: distribución de notas por rango (rojo < 4,0). */
export function GradeHistogram({ data, height = 168 }: GradeHistogramProps) {
  const { ref, width } = useChartWidth()
  const padL = 14
  const padR = 14
  const padT = 20
  const padB = 26
  const iw = Math.max(width - padL - padR, 10)
  const ih = height - padT - padB
  const maxC = Math.max(...data.map((d) => d.count), 1)
  const gap = 12
  const bw = (iw - gap * (data.length - 1)) / data.length

  return (
    <div ref={ref} className="w-full min-w-0" style={{ minHeight: height }}>
      <svg width={width} height={height} role="img" aria-label="Distribución de notas">
        <line x1={padL} x2={padL + iw} y1={padT + ih} y2={padT + ih} stroke="var(--color-border)" strokeWidth="1" />
        {data.map((d, i) => {
          const bh = (d.count / maxC) * ih
          const bx = padL + i * (bw + gap)
          const by = padT + ih - bh
          return (
            <g key={d.label}>
              <rect x={bx} y={padT} width={bw} height={ih} rx="5" fill="var(--color-surface)" />
              <rect x={bx} y={by} width={bw} height={Math.max(bh, d.count ? 3 : 0)} rx="5" fill={TONE[d.tone]} />
              {d.count > 0 && (
                <text x={bx + bw / 2} y={by - 7} textAnchor="middle" fontSize="12" fontWeight="600" fontFamily="var(--font-mono)" fill="var(--color-foreground)">
                  {d.count}
                </text>
              )}
              <text x={bx + bw / 2} y={height - 8} textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="var(--color-muted)">
                {d.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
