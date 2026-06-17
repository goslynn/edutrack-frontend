/**
 * Derivaciones puras de Asistencia ("cómo se calcula lo que se pinta"): mapas
 * n→estado, conteos y % a partir de las listas de excepción o de las marcas en
 * edición. No son datos del backend — viven en la capa de componentes y reciben
 * la nómina / el total como parámetros (sin closures sobre el stub).
 */

import type { AttSummary, HistorySession, Marks, Student } from "@/types/asistencia"

type Exceptions = Pick<HistorySession, "at" | "au" | "ju">

/** Mapa completo n→estado de un registro cerrado (resto = presente). */
export function statusMap(session: Exceptions, students: Student[]): Marks {
  const m: Marks = {}
  students.forEach((s) => {
    m[s.n] = "presente"
  })
  session.at.forEach((n) => (m[n] = "atrasado"))
  session.au.forEach((n) => (m[n] = "ausente"))
  session.ju.forEach((n) => (m[n] = "justificado"))
  return m
}

/** Conteos + % de asistencia desde las listas de excepción de una sesión. */
export function summarize(session: Exceptions, total: number): AttSummary {
  const atrasado = session.at.length
  const ausente = session.au.length
  const justificado = session.ju.length
  const presente = total - atrasado - ausente - justificado
  const pct = Math.round(((presente + atrasado) / total) * 100)
  return { total, presente, atrasado, ausente, justificado, pct }
}

/** Conteos + % desde un mapa n→estado (la sesión en edición). */
export function summ(marks: Marks, total: number): AttSummary {
  const v = { presente: 0, atrasado: 0, ausente: 0, justificado: 0 }
  Object.values(marks).forEach((s) => {
    v[s] += 1
  })
  const pct = Math.round(((v.presente + v.atrasado) / total) * 100)
  return { ...v, total, pct }
}

/** Marcas iniciales: todos presentes. */
export function freshMarks(students: Student[]): Marks {
  const m: Marks = {}
  students.forEach((s) => {
    m[s.n] = "presente"
  })
  return m
}

/** Hora actual "HH:MM" para sellar el cierre del registro. */
export function nowTime(): string {
  const d = new Date()
  return (
    String(d.getHours()).padStart(2, "0") +
    ":" +
    String(d.getMinutes()).padStart(2, "0")
  )
}
