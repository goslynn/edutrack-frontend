/**
 * Tipos del modelo de dominio de Anotaciones (registro de convivencia escolar).
 * Reflejan el shape que en producción entrega el Annotation microservice
 * (cl.duocuc.edutrack.ms.annotation) vía API Gateway. La capa visual se tipa
 * contra estos; los datos de muestra viven en `@/data/anotaciones-stub`.
 */

export type AnnotationType = "POSITIVE" | "NEGATIVE"

export interface Annotation {
  id: string
  studentId: string
  student: string
  /** Nombre legible del docente autor (el id lo aporta la sesión). */
  author: string
  type: AnnotationType
  content: string
  /** Día al que refiere la anotación (ISO). */
  date: string
  /** Solo las negativas disparan la notificación al apoderado. */
  guardianNotified: boolean
}

export interface RosterStudent {
  id: string
  name: string
}

/** Identidad del docente autenticado (en producción, del JWT propagado). */
export interface Teacher {
  id: string
  name: string
}
