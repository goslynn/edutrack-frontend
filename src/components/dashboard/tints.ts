import type { StatTint } from "@/data/dashboard-stub"

/** Pares fondo/texto (tinte suave) por rol, solo tokens semánticos. */
export const ICON_TINT: Record<StatTint, string> = {
  primary: "bg-primary-soft text-primary",
  accent: "bg-accent-soft text-accent",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning-strong",
}
