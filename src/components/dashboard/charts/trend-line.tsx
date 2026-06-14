import type { TrendPoint } from "@/data/dashboard-stub"
import { useChartWidth } from "./use-chart-width"

interface TrendLineProps {
  data: TrendPoint[]
  height?: number
}

/** Línea: promedio del curso por unidad (escala 1,0–7,0). */
export function TrendLine({ data, height = 168 }: TrendLineProps) {
  const { ref, width } = useChartWidth()
  const padL = 30
  const padR = 14
  const padT = 16
  const padB = 26
  const min = 1
  const max = 7
  const iw = Math.max(width - padL - padR, 10)
  const ih = height - padT - padB
  const x = (i: number) =>
    padL + (data.length === 1 ? iw / 2 : (i / (data.length - 1)) * iw)
  const y = (v: number) => padT + ih - ((v - min) / (max - min)) * ih
  const pts = data.map((d, i) => [x(i), y(d.value)] as const)
  const line = pts.map((p) => p.join(",")).join(" ")
  const area = `${padL},${padT + ih} ${line} ${padL + iw},${padT + ih}`
  const gridV = [2, 3, 4, 5, 6, 7]
  const last = data[data.length - 1]

  return (
    <div ref={ref} className="w-full min-w-0" style={{ minHeight: height }}>
      <svg width={width} height={height} role="img" aria-label="Promedio del curso por unidad">
        <defs>
          <linearGradient id="et-trend-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.16" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {gridV.map((g) => (
          <g key={g}>
            <line x1={padL} x2={padL + iw} y1={y(g)} y2={y(g)} stroke="var(--color-border)" strokeWidth="1" />
            <text x={padL - 8} y={y(g) + 3.5} textAnchor="end" fontSize="10" fontFamily="var(--font-mono)" fill="var(--color-muted)">
              {g},0
            </text>
          </g>
        ))}
        <polygon points={area} fill="url(#et-trend-area)" />
        <polyline
          points={line}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={p[0]}
            cy={p[1]}
            r={i === pts.length - 1 ? 4.5 : 3}
            fill="var(--color-background)"
            stroke="var(--color-primary)"
            strokeWidth="2.5"
          />
        ))}
        {data.map((d, i) => (
          <text key={i} x={x(i)} y={height - 8} textAnchor="middle" fontSize="11" fontFamily="var(--font-sans)" fill="var(--color-muted)">
            {d.label}
          </text>
        ))}
        <text
          x={x(data.length - 1)}
          y={y(last.value) - 11}
          textAnchor="middle"
          fontSize="12"
          fontWeight="600"
          fontFamily="var(--font-mono)"
          fill="var(--color-primary)"
        >
          {last.value.toFixed(1).replace(".", ",")}
        </text>
      </svg>
    </div>
  )
}
