/**
 * Tipos del modelo de dominio de «Calificaciones». Reflejan el shape que en
 * producción entrega MS-Assessment vía API Gateway (y MS-Course / MS-Student para
 * asignaturas y roster). La capa visual se tipa contra estos; los datos de muestra
 * viven en `@/data/calificaciones-stub` y los helpers de dominio / presentación en
 * la capa de componentes (`calificaciones-meta`).
 *
 * RBAC se modela como un estado por acción: "enabled" | "disabled" | "hidden".
 * Lo resuelve el backend (auth) por usuario; la UI nunca explica el porqué.
 */

export type RowState = "enabled" | "disabled" | "hidden"

/** Asignatura del periodo (MS-Course). Define el alcance de las operaciones. */
export interface Subject {
  id: string
  name: string
  course: string
  teacher: string
}

/** Alumno del roster (MS-Student), versión liviana para el libro de notas. */
export interface RosterStudent {
  id: string
  rut: string
  firstName: string
  lastName: string
}

/** Evaluación (MS-Assessment). La ponderación es un porcentaje (0, 100]. */
export interface Evaluation {
  id: string
  subjectId: string
  period: string
  name: string
  /** Fecha de la evaluación (ISO `YYYY-MM-DD`). */
  evaluationDate: string
  /** Ponderación porcentual dentro del periodo. */
  weight: number
  createdAt: string
  updatedAt: string
}

/** Nota registrada de un alumno en una evaluación (escala chilena 1,0–7,0). */
export interface Grade {
  id: string
  evaluationId: string
  studentId: string
  score: number
  createdAt: string
  updatedAt: string
}

/**
 * Entrada del log de auditoría de una nota (BE-ASS-003, inmutable). El alta lleva
 * `oldValue = null`; cada corrección guarda el valor anterior, el nuevo, el autor
 * y la fecha. `changedBy` es el id de usuario (se resuelve a nombre con el mapa
 * `users` del stub).
 */
export interface GradeAuditEntry {
  id: string
  oldValue: number | null
  newValue: number
  changedBy: string
  changedAt: string
}

/** Auditoría indexada por id de nota. */
export type AuditByGrade = Record<string, GradeAuditEntry[]>

/** Promedio ponderado de un alumno (lectura derivada, BE-ASS-002). */
export interface WeightedAverage {
  average: number
  gradeCount: number
}

/** Acciones gobernadas por RBAC sobre el MS-Assessment. */
export type PermAction =
  | "evaluations.create"
  | "evaluations.edit"
  | "evaluations.delete"
  | "grades.write"
  | "audit.read"

export type PermMap = Record<PermAction, RowState>
