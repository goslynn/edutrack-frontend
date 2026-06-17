/**
 * Presentación y reglas de "Estudiantes y cursos" ("cómo se pinta y qué se
 * permite mostrar"): mapas de estado→badge/label, máquina de transiciones,
 * opciones de formulario y validadores de dominio (espejo de Rut.java y las
 * reglas del MS-Student). No son datos del backend — viven en la capa de
 * componentes, no en el stub ni en `@/types`.
 */

import type {
  CourseStatus,
  RelationType,
  StudentStatus,
} from "@/types/estudiantes"
import type { Course } from "@/types/estudiantes"

type BadgeVariant = "success" | "primary" | "neutral"

export const COURSE_STATUS: Record<CourseStatus, { label: string; variant: BadgeVariant }> = {
  ACTIVE: { label: "Activo", variant: "success" },
  DELETED: { label: "Eliminado", variant: "neutral" },
}

export const STUDENT_STATUS: Record<StudentStatus, { label: string; variant: BadgeVariant }> = {
  ACTIVE: { label: "Activo", variant: "success" },
  TRANSFERRED: { label: "Trasladado", variant: "primary" },
  DELETED: { label: "Eliminado", variant: "neutral" },
}

/** Máquina de estados del alumno (MS-Student StudentStatus.canTransitionTo). */
export const STUDENT_TRANSITIONS: Record<StudentStatus, StudentStatus[]> = {
  ACTIVE: ["TRANSFERRED", "DELETED"],
  TRANSFERRED: ["TRANSFERRED", "DELETED"],
  DELETED: [],
}

export const RELATIONS: Record<RelationType, string> = {
  PARENT: "Padre / Madre",
  GUARDIAN: "Apoderado legal",
  TUTOR: "Tutor",
}

export const COURSE_LEVELS = [
  "7° Básico", "8° Básico", "1° Medio", "2° Medio", "3° Medio", "4° Medio",
]
export const ACADEMIC_YEARS = [2025, 2026, 2027]

/* ── Validadores de dominio (espejo de Rut.java + reglas del MS-Student) ── */

function cleanRut(v: string): string {
  return (v || "").replace(/[.\-\s]/g, "").toUpperCase()
}

/** Formatea un RUT con puntos y guion (12.345.678-5). */
export function formatRut(v: string): string {
  const c = cleanRut(v)
  if (c.length < 2) return v
  const body = c.slice(0, -1)
  const dv = c.slice(-1)
  return body.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "-" + dv
}

/** Valida un RUT chileno con módulo 11 (igual que Rut.java). */
export function rutValid(v: string): boolean {
  const c = cleanRut(v)
  if (!/^\d{7,8}[0-9K]$/.test(c)) return false
  const body = c.slice(0, -1)
  const dv = c.slice(-1)
  let sum = 0
  let mul = 2
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * mul
    mul = mul === 7 ? 2 : mul + 1
  }
  const res = 11 - (sum % 11)
  const calc = res === 11 ? "0" : res === 10 ? "K" : String(res)
  return calc === dv
}

export function emailValid(e: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)
}

/** Edad cumplida a partir de una fecha ISO de nacimiento. */
export function ageFrom(birth: string): number | null {
  if (!birth) return null
  const b = new Date(birth)
  const n = new Date()
  let a = n.getFullYear() - b.getFullYear()
  if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) a--
  return a
}

export const courseName = (list: Course[], id: string): string =>
  list.find((c) => c.id === id)?.name ?? "—"
