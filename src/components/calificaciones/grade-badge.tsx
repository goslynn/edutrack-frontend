import { cn } from "@/lib/utils"
import { fmtGrade, gradeVariant } from "./calificaciones-meta"

const VARIANT_CLASS = {
  success: "bg-success-soft text-success",
  primary: "bg-primary-soft text-primary",
  danger: "bg-danger-soft text-danger",
} as const

interface GradeBadgeProps {
  /** Nota en escala 1,0–7,0; `null` se pinta como guion atenuado. */
  score: number | null | undefined
  className?: string
}

/** Píldora de nota: tinte por aprobación (rojo < 4,0 · azul 4,0–5,9 · verde ≥ 6,0). */
export function GradeBadge({ score, className }: GradeBadgeProps) {
  if (score == null) return <span className={cn("text-muted", className)}>—</span>
  return (
    <span
      className={cn(
        "inline-flex min-w-[44px] items-center justify-center rounded-full px-2.5 py-[3px] font-mono text-[13px] font-semibold tabular-nums",
        VARIANT_CLASS[gradeVariant(score)],
        className
      )}
    >
      {fmtGrade(score)}
    </span>
  )
}
