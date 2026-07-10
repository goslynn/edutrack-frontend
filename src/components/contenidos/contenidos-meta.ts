/**
 * Presentación y reglas de «Contenido» ("cómo se pinta"): formateo de tamaños
 * y fechas con convención chilena, pluralización española y mapeo extensión →
 * icono Lucide. No son datos del backend — viven en la capa de componentes.
 */

import {
  FileArchiveIcon,
  FileAudioIcon,
  FileIcon,
  FileImageIcon,
  FileTextIcon,
  FileTypeIcon,
  FileVideoIcon,
  PresentationIcon,
  SheetIcon,
  type LucideIcon,
} from "lucide-react"

/** Tamaño legible con coma decimal chilena (1,5 MB). */
export function fmtBytes(n: number | null | undefined): string {
  if (n == null) return "—"
  if (n < 1024) return `${n} B`
  const u = ["KB", "MB", "GB"]
  let i = -1
  let v = n
  do {
    v /= 1024
    i++
  } while (v >= 1024 && i < u.length - 1)
  return `${v.toFixed(v < 10 ? 1 : 0).replace(".", ",")} ${u[i]}`
}

/** Fecha dd-mm-aaaa. */
export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—"
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`
}

/** Hora hh:mm. */
export function fmtTime(iso: string | Date): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

/** Plural español simple: vocal → +s · consonante → +es (unidad→unidades). */
export function plural(word: string, n: number): string {
  if (n === 1) return word
  return /[aeiouáéíóú]$/i.test(word) ? word + "s" : word + "es"
}

/** `${n} ${plural(word, n)}` — cantidad + sustantivo concordado. */
export function count(word: string, n: number): string {
  return `${n} ${plural(word, n)}`
}

interface FileMeta {
  icon: LucideIcon
  label: string
}

const EXT_META: Record<string, FileMeta> = {
  pdf: { icon: FileTextIcon, label: "PDF" },
  doc: { icon: FileTypeIcon, label: "Word" },
  docx: { icon: FileTypeIcon, label: "Word" },
  ppt: { icon: PresentationIcon, label: "PPT" },
  pptx: { icon: PresentationIcon, label: "PPT" },
  xls: { icon: SheetIcon, label: "Excel" },
  xlsx: { icon: SheetIcon, label: "Excel" },
  mp4: { icon: FileVideoIcon, label: "Video" },
  mov: { icon: FileVideoIcon, label: "Video" },
  mp3: { icon: FileAudioIcon, label: "Audio" },
  png: { icon: FileImageIcon, label: "Imagen" },
  jpg: { icon: FileImageIcon, label: "Imagen" },
  jpeg: { icon: FileImageIcon, label: "Imagen" },
  zip: { icon: FileArchiveIcon, label: "ZIP" },
}

/** Extensión → icono + etiqueta corta. */
export function fileMeta(filename: string): FileMeta {
  const ext = (filename.split(".").pop() || "").toLowerCase()
  return EXT_META[ext] || { icon: FileIcon, label: ext ? ext.toUpperCase() : "Archivo" }
}
