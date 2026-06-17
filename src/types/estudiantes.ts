/**
 * Tipos del modelo de dominio de «Estudiantes y cursos». Reflejan el shape que en
 * producción entregan MS-Student y MS-Course vía API Gateway. La capa visual se
 * tipa contra estos; los datos de muestra viven en `@/data/estudiantes-stub` y
 * los mapas de presentación / validadores en la capa de componentes.
 *
 * RBAC se modela como un estado por acción: "enabled" | "disabled" | "hidden".
 * Lo resuelve el backend (auth) por usuario; la UI nunca explica el porqué.
 */

export type RowState = "enabled" | "disabled" | "hidden"

export type CourseStatus = "ACTIVE" | "DELETED"
export type StudentStatus = "ACTIVE" | "TRANSFERRED" | "DELETED"
export type RelationType = "PARENT" | "GUARDIAN" | "TUTOR"

export interface Guardian {
  firstName: string
  lastName: string
  email: string
  phone: string
  relationType: RelationType
}

export interface Student {
  id: string
  rut: string
  firstName: string
  lastName: string
  birthDate: string
  courseId: string
  status: StudentStatus
  guardians: Guardian[]
}

export interface Course {
  id: string
  name: string
  level: string
  section: string
  academicYear: number
  description: string
  status: CourseStatus
}

/** Acciones gobernadas por RBAC. */
export type PermAction =
  | "students.create"
  | "students.edit"
  | "students.transfer"
  | "students.delete"
  | "courses.create"
  | "courses.edit"
  | "courses.delete"

export type PermMap = Record<PermAction, RowState>
