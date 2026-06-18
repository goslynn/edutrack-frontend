/**
 * Reglas de dominio y presentación de «Calificaciones» ("cómo se calcula y cómo se
 * pinta"): escala chilena de notas, formateo con coma decimal, promedio ponderado
 * (espejo de las reglas del MS-Assessment) y color del badge por aprobación. No son
 * datos del backend — viven en la capa de componentes, no en el stub ni en `@/types`.
 */

import type {
  Evaluation,
  Grade,
  RosterStudent,
  WeightedAverage,
} from "@/types/calificaciones"

/* ── Escala de notas chilena (entity Score) ─────────────────────────────── */
export const SCORE_MIN = 1.0
export const SCORE_MAX = 7.0
/** Nota de aprobación. */
export const PASS_MARK = 4.0

/** Redondeo a 1 decimal, HALF_UP para positivos (igual que el backend). */
export const round1 = (x: number): number =>
  Math.round((x + Number.EPSILON) * 10) / 10

/** Una nota es válida si cae dentro de la escala [1,0 , 7,0]. */
export const scoreValid = (v: number | null | undefined): v is number =>
  v != null && !Number.isNaN(v) && v >= SCORE_MIN && v <= SCORE_MAX

/** Formatea una nota con coma chilena y 1 decimal ("5,9"); `null` → "—". */
export const fmtGrade = (v: number | null | undefined): string =>
  v == null || Number.isNaN(v) ? "—" : round1(Number(v)).toFixed(1).replace(".", ",")

/** Parsea la entrada del usuario ("5,9" / "5.9") → number, o null si vacío/inválido. */
export const parseGrade = (s: string | null | undefined): number | null => {
  if (s == null) return null
  const t = String(s).trim().replace(",", ".")
  if (t === "") return null
  const n = Number(t)
  return Number.isNaN(n) ? null : n
}

/** ISO `YYYY-MM-DD` → `DD-MM-YYYY`. */
export const fmtDate = (iso: string | null | undefined): string => {
  if (!iso) return "—"
  const [y, m, d] = iso.slice(0, 10).split("-")
  return `${d}-${m}-${y}`
}

/** ISO datetime → `DD-MM-YYYY HH:mm`. */
export const fmtDateTime = (iso: string | null | undefined): string => {
  if (!iso) return "—"
  const dt = new Date(iso)
  const p = (n: number) => String(n).padStart(2, "0")
  return `${p(dt.getDate())}-${p(dt.getMonth() + 1)}-${dt.getFullYear()} ${p(dt.getHours())}:${p(dt.getMinutes())}`
}

/** Nombre completo del alumno. */
export const studentName = (s: RosterStudent): string => `${s.firstName} ${s.lastName}`

/** Variante semántica del badge de nota según aprobación. */
export type GradeVariant = "success" | "primary" | "danger"
export const gradeVariant = (score: number): GradeVariant =>
  score < PASS_MARK ? "danger" : score >= 6 ? "success" : "primary"

/**
 * Promedio ponderado (BE-ASS-002): `Σ(nota·ponderación) / Σ(ponderación)` sobre las
 * notas existentes del alumno en la asignatura/periodo, redondeado a 1 decimal.
 * Devuelve `null` cuando no hay notas (no exige que las ponderaciones sumen 100).
 */
export function weightedAverage(
  studentId: string,
  subjectId: string,
  period: string,
  allGrades: Grade[],
  allEvals: Evaluation[]
): WeightedAverage | null {
  const evalById = new Map<string, Evaluation>()
  for (const e of allEvals) {
    if (e.subjectId === subjectId && e.period === period) evalById.set(e.id, e)
  }
  let ws = 0
  let tw = 0
  let count = 0
  for (const g of allGrades) {
    const e = evalById.get(g.evaluationId)
    if (e && g.studentId === studentId) {
      ws += g.score * e.weight
      tw += e.weight
      count++
    }
  }
  if (count === 0 || tw === 0) return null
  return { average: round1(ws / tw), gradeCount: count }
}
