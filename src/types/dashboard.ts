/**
 * Tipos del modelo de dominio del dashboard. Reflejan el shape que en producción
 * arman los hooks contenedores desde los microservicios (Course / Attendance /
 * Assessment / Annotation) vía API Gateway. La capa visual se tipa contra estos;
 * los datos de muestra viven en `@/data/dashboard-stub`.
 *
 * Los `icon` son claves estables (kebab-case) que la capa visual resuelve a un
 * icono de lucide-react; así el dato se mantiene serializable.
 */

export type StatTint = "primary" | "accent" | "success" | "warning"
export type DeltaTone = "up" | "down"
export type GradeTone = "low" | "mid" | "high"
export type ShortcutKind = "now" | "pending"

/** Ids de sección navegable (coinciden con la nav del sidebar). */
export type SectionId =
  | "inicio"
  | "calificaciones"
  | "asistencia"
  | "anotaciones"
  | "evaluaciones"
  | "contenidos"
  | "estudiantes"
  | "reportes"
  | "notificaciones"
  | "configuracion"

export interface Course {
  id: string
  name: string
  role: string
  students: number
  avg: number
  attendance: number
}

export interface QuickStat {
  id: string
  icon: string
  tint: StatTint
  label: string
  value: string
  delta?: string
  tone?: DeltaTone
  sub: string
}

export interface TrendPoint {
  label: string
  value: number
}

export interface GradeBucket {
  label: string
  count: number
  tone: GradeTone
}

export interface AttendanceDay {
  label: string
  value: number
}

export interface Shortcut {
  id: string
  kind: ShortcutKind
  icon: string
  title: string
  meta: string
  badge: string
  target: SectionId
}

export interface QuickAction {
  id: string
  icon: string
  label: string
  target: SectionId
}

export type NotificationTone = "warning" | "success" | "primary"

export interface DashboardNotification {
  id: string
  tone: NotificationTone
  tag: string
  text: string
}

export interface DashboardData {
  today: {
    greeting: string
    dateLabel: string
    summary: string
  }
  courses: Course[]
  stats: QuickStat[]
  avgTrend: TrendPoint[]
  gradeDist: GradeBucket[]
  attendanceWeek: AttendanceDay[]
  shortcuts: Shortcut[]
  quickActions: QuickAction[]
  notifications: DashboardNotification[]
}

export interface CurrentUser {
  name: string
  role: string
}
