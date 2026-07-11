/**
 * Presentación y derivaciones de «Reportes» ("cómo se pinta"): metadatos de
 * formato/dominio, helpers de fecha/tamaño y el disparador de descarga. El
 * `reportKey` sigue la convención `<dominio>.<reporte>` del backend
 * (`ReportDefinition.reportKey`); el dominio se deriva de ese prefijo — no es
 * un campo del backend, vive solo en esta capa de presentación.
 */

import {
  BellIcon,
  BookOpenIcon,
  CalendarCheckIcon,
  FileTextIcon,
  GraduationCapIcon,
  MessageSquareTextIcon,
  MonitorIcon,
  Table2Icon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"

import type { ReportFormat } from "@/types/reportes"

export const FORMAT_META: Record<ReportFormat, { label: string; hint: string; icon: LucideIcon }> = {
  JSON: { label: "Preview", hint: "Se arma en pantalla", icon: MonitorIcon },
  CSV: { label: "CSV", hint: "Descarga de planilla", icon: Table2Icon },
  PDF: { label: "PDF", hint: "Descarga de documento", icon: FileTextIcon },
}

/** Orden de presentación fijo — el backend expone `supportedFormats` como `Set` (sin orden garantizado). */
export const FORMAT_ORDER: ReportFormat[] = ["JSON", "CSV", "PDF"]

/** Ordena una lista de formatos según `FORMAT_ORDER`, sin importar el orden en que llegó del backend. */
export function sortFormats(formats: ReportFormat[]): ReportFormat[] {
  return FORMAT_ORDER.filter((f) => formats.includes(f))
}

const FORMAT_EXT: Record<Extract<ReportFormat, "CSV" | "PDF">, string> = { CSV: "csv", PDF: "pdf" }

/** Mismo nombre que arma el backend (`<reportKey>.<ext>`; ver CsvRenderer/PdfRenderer). */
export function reportFilename(reportKey: string, format: Extract<ReportFormat, "CSV" | "PDF">): string {
  return `${reportKey}.${FORMAT_EXT[format]}`
}

interface DomainMeta {
  label: string
  icon: LucideIcon
}

const DOMAIN_META: Record<string, DomainMeta> = {
  academico: { label: "Académico", icon: GraduationCapIcon },
  calificaciones: { label: "Calificaciones", icon: GraduationCapIcon },
  asistencia: { label: "Asistencia", icon: CalendarCheckIcon },
  anotaciones: { label: "Convivencia", icon: MessageSquareTextIcon },
  convivencia: { label: "Convivencia", icon: MessageSquareTextIcon },
  estudiantes: { label: "Estudiantes", icon: UsersIcon },
  notificaciones: { label: "Sistema", icon: BellIcon },
  sistema: { label: "Sistema", icon: BellIcon },
}

const DEFAULT_DOMAIN: DomainMeta = { label: "Otros", icon: BookOpenIcon }

/** Prefijo antes del primer punto de `reportKey` (`<dominio>.<reporte>`). */
export function domainOf(reportKey: string): string {
  const i = reportKey.indexOf(".")
  return i === -1 ? reportKey : reportKey.slice(0, i)
}

function capitalize(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s
}

/** Metadatos visuales de un dominio (ya extraído); degrada a rótulo capitalizado + icono genérico. */
export function domainMetaFor(domain: string): DomainMeta {
  return DOMAIN_META[domain] ?? { label: capitalize(domain), icon: DEFAULT_DOMAIN.icon }
}

/** Metadatos visuales del dominio de un `reportKey` completo. */
export function domainMeta(reportKey: string): DomainMeta {
  return domainMetaFor(domainOf(reportKey))
}

/** Columnas del preview: las claves de la primera fila, en el orden que llegan del backend. */
export function previewColumns(rows: Array<Record<string, unknown>>): string[] {
  return rows.length ? Object.keys(rows[0]) : []
}

export function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "—"
  if (typeof value === "boolean") return value ? "Sí" : "No"
  return String(value)
}

/** `DD-MM-YYYY · HH:mm`. */
export function fmtDateTime(iso: string): string {
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, "0")
  return `${p(d.getDate())}-${p(d.getMonth() + 1)}-${d.getFullYear()} · ${p(d.getHours())}:${p(d.getMinutes())}`
}

export function fmtBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + " KB"
  return bytes + " B"
}

/** Dispara la descarga de un blob ya generado, vía un object URL de vida corta. */
export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
