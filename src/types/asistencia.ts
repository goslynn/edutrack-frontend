/**
 * Tipos del modelo de dominio de Asistencia. Reflejan el shape que en producción
 * entregan los microservicios Attendance / Course / Student vía API Gateway. La
 * capa visual se tipa contra estos; los datos de muestra y los helpers de
 * derivación viven, respectivamente, en `@/data/asistencia-stub` y en la capa de
 * componentes (`att-derive`).
 *
 * Un "registro" de una sesión cerrada es INMUTABLE por contrato de API: solo se
 * consulta. Los permisos se modelan aparte como estado `enabled|disabled|hidden`
 * por acción — la única expresión de RBAC.
 */

export type AttStatus = "presente" | "atrasado" | "ausente" | "justificado"
export type Marks = Record<number, AttStatus>
export type PermState = "enabled" | "disabled" | "hidden"

export interface AsistenciaPerms {
  /** Tomar/registrar la asistencia de la clase de hoy. */
  take: PermState
  /** Exportar el registro. */
  export: PermState
  /** Ver un registro cerrado (solo lectura). */
  view: PermState
}

export interface Student {
  n: number
  first: string
  last: string
  name: string
  rut: string
  /** UUID de MS-Student. Presente cuando los datos vienen de la API; ausente en el stub. */
  id?: string
}

/** Sesión cerrada e inmutable, guardada como listas de excepción (resto = presente). */
export interface HistorySession {
  id: string
  dateLabel: string
  dow: string
  short: string
  time: string
  by: string
  at: number[]
  au: number[]
  ju: number[]
}

export interface AttSummary {
  total: number
  presente: number
  atrasado: number
  ausente: number
  justificado: number
  /** % de asistencia = (presentes + atrasados) / total. */
  pct: number
}

export interface AttCourse {
  id: string
  name: string
  subject: string
  room: string
  block: string
  students: number
}

export interface CourseOption {
  id: string
  name: string
  role: string
}

/** Clase de hoy en contexto. */
export interface AttToday {
  dateLabel: string
  time: string
  taken: boolean
}

/** Estadísticas agregadas del mes. */
export interface AttMonthStats {
  pct: number
  deltaPct: string
  sessions: number
  lateAvg: number
}

/**
 * Bundle de datos que alimenta la pantalla de Asistencia. En producción es el
 * agregado que arman los hooks contenedores desde varios microservicios.
 */
export interface AsistenciaData {
  course: AttCourse
  courses: CourseOption[]
  students: Student[]
  today: AttToday
  history: HistorySession[]
  monthStats: AttMonthStats
  perms: AsistenciaPerms
}
