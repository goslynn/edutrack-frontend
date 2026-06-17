import type { AttStatus } from "@/types/asistencia"

/** Vocabulario de estado: etiqueta legible + variant del Badge. */
export const STATUS: Record<
  AttStatus,
  { label: string; badge: "success" | "warning" | "danger" | "primary" }
> = {
  presente: { label: "Presente", badge: "success" },
  atrasado: { label: "Atrasado", badge: "warning" },
  ausente: { label: "Ausente", badge: "danger" },
  justificado: { label: "Justificado", badge: "primary" },
}

export const ATT_OPTS: { v: AttStatus; label: string }[] = [
  { v: "presente", label: "Presente" },
  { v: "atrasado", label: "Atrasado" },
  { v: "ausente", label: "Ausente" },
  { v: "justificado", label: "Justificado" },
]

/** Color de "dot" / segmento por estado (solo tokens semánticos). */
export const DOT_BG: Record<AttStatus, string> = {
  presente: "bg-success",
  atrasado: "bg-warning",
  ausente: "bg-danger",
  justificado: "bg-primary",
}

/** Fondo del botón activo en el segmented de la nómina. */
export const ON_BG: Record<AttStatus, string> = {
  presente: "bg-success text-success-foreground",
  atrasado: "bg-warning text-foreground",
  ausente: "bg-danger text-danger-foreground",
  justificado: "bg-primary text-primary-foreground",
}
