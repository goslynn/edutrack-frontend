/**
 * Presentación propia de la pantalla de Anotaciones ("cómo se pinta"): etiqueta y
 * variante de badge por tipo, formato de fecha relativa y el límite de contenido.
 * No son datos del backend — viven en la capa de componentes, no en el stub ni en
 * `@/types`.
 */

import type { AnnotationType } from "@/types/anotaciones"

/** Etiqueta y variante de Badge por tipo de anotación. */
export const TYPE_META: Record<
  AnnotationType,
  { label: string; badge: "success" | "danger" }
> = {
  POSITIVE: { label: "Positiva", badge: "success" },
  NEGATIVE: { label: "Negativa", badge: "danger" },
}

/** Largo máximo del contenido (BE-ANN: content ≤ 1000). */
export const MAX_CONTENT = 1000

const MES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
]

/** Fecha relativa legible: «Hoy» / «Ayer» / «12 jun» respecto a `today` (ISO). */
export function formatAnnoDate(iso: string, today: string): string {
  const d = new Date(iso + "T00:00:00")
  const t = new Date(today + "T00:00:00")
  const diff = Math.round((t.getTime() - d.getTime()) / 86_400_000)
  if (diff === 0) return "Hoy"
  if (diff === 1) return "Ayer"
  return `${d.getDate()} ${MES[d.getMonth()]}`
}
