/**
 * Datos de muestra (stub) de la pantalla «Calificaciones». Modela fielmente el
 * MS-Assessment (evaluaciones, notas y auditoría inmutable), más asignaturas y
 * roster que en producción llegan de MS-Course / MS-Student. Todo esto vendrá del
 * backend vía API Gateway y hooks contenedores — aquí lo inyecta la página. Solo
 * datos: los tipos viven en `@/types/calificaciones` y las reglas/formatos de
 * dominio en la capa de componentes (`calificaciones-meta`).
 *
 * RBAC se modela como un estado por acción: "enabled" | "disabled" | "hidden".
 * Lo resuelve el backend (auth) por usuario; aquí se fija el del usuario en sesión.
 */

import type {
  AuditByGrade,
  Evaluation,
  Grade,
  PermMap,
  RosterStudent,
  Subject,
} from "@/types/calificaciones"

/**
 * Mapa de permisos del usuario en sesión. El rol lo resuelve la capa de auth y es
 * opaco para la UI; aquí se fija el del usuario autenticado (administración / UTP,
 * acceso total incluida la auditoría).
 */
export const perms: PermMap = {
  "evaluations.create": "enabled",
  "evaluations.edit": "enabled",
  "evaluations.delete": "enabled",
  "grades.write": "enabled",
  "audit.read": "enabled",
}

/** Id del usuario en sesión: queda como autor de las notas que registra/corrige. */
export const currentUserId = "u-utp"

/** Resolución id → nombre para mostrar el autor en la auditoría. */
export const users: Record<string, string> = {
  "u-rojas": "María Rojas",
  "u-riquelme": "Sebastián Riquelme",
  "u-utp": "Daniela Fuentes (UTP)",
}

/** Periodos académicos disponibles. */
export const periods = ["2026-1", "2026-2"]

/** Asignaturas del curso 1° Medio A (MS-Course). */
export const subjects: Subject[] = [
  { id: "subj-mat", name: "Matemática", course: "1° Medio A", teacher: "María Rojas" },
  { id: "subj-len", name: "Lenguaje y comunicación", course: "1° Medio A", teacher: "Sebastián Riquelme" },
  { id: "subj-his", name: "Historia y geografía", course: "1° Medio A", teacher: "Carolina Tapia" },
]

/** Roster del curso (MS-Student). */
export const students: RosterStudent[] = [
  { id: "s1", rut: "21.345.678-5", firstName: "Sofía", lastName: "Contreras Díaz" },
  { id: "s2", rut: "21.456.789-0", firstName: "Matías", lastName: "Fernández Soto" },
  { id: "s3", rut: "21.567.890-K", firstName: "Antonia", lastName: "Muñoz Rivas" },
  { id: "s4", rut: "21.678.901-2", firstName: "Benjamín", lastName: "Araya Pérez" },
  { id: "s5", rut: "21.789.012-3", firstName: "Florencia", lastName: "Vega Castro" },
  { id: "s6", rut: "20.890.123-4", firstName: "Tomás", lastName: "Reyes Lagos" },
  { id: "s7", rut: "20.901.234-5", firstName: "Isidora", lastName: "Navarro Bravo" },
  { id: "s8", rut: "22.012.345-6", firstName: "Vicente", lastName: "Espinoza Rojas" },
  { id: "s9", rut: "22.123.456-7", firstName: "Emilia", lastName: "Cárdenas Mora" },
  { id: "s10", rut: "22.234.567-8", firstName: "Joaquín", lastName: "Salazar Vidal" },
  { id: "s11", rut: "22.345.678-9", firstName: "Catalina", lastName: "Herrera Pinto" },
  { id: "s12", rut: "22.456.789-0", firstName: "Lucas", lastName: "Morales Tapia" },
]

/**
 * Evaluaciones. Matemática 2026-1 suma 100% de ponderación (5 evaluaciones);
 * `e-mat-5` (examen) aún sin notas → ilustra el flujo "registrar notas" y el borrado
 * permitido (DELETE 204 vs 409 si tuviera notas).
 */
export const evaluations: Evaluation[] = [
  { id: "e-mat-1", subjectId: "subj-mat", period: "2026-1", name: "Prueba Unidad 1: Números enteros", evaluationDate: "2026-04-10", weight: 25, createdAt: "2026-04-11T14:20:00Z", updatedAt: "2026-04-11T14:20:00Z" },
  { id: "e-mat-2", subjectId: "subj-mat", period: "2026-1", name: "Control de fracciones", evaluationDate: "2026-04-28", weight: 10, createdAt: "2026-04-29T11:05:00Z", updatedAt: "2026-04-29T11:05:00Z" },
  { id: "e-mat-3", subjectId: "subj-mat", period: "2026-1", name: "Trabajo grupal: estadística", evaluationDate: "2026-05-15", weight: 15, createdAt: "2026-05-16T09:40:00Z", updatedAt: "2026-05-18T16:10:00Z" },
  { id: "e-mat-4", subjectId: "subj-mat", period: "2026-1", name: "Prueba Unidad 2: Álgebra", evaluationDate: "2026-05-30", weight: 30, createdAt: "2026-06-01T13:00:00Z", updatedAt: "2026-06-01T13:00:00Z" },
  { id: "e-mat-5", subjectId: "subj-mat", period: "2026-1", name: "Examen semestral", evaluationDate: "2026-06-25", weight: 20, createdAt: "2026-06-10T10:00:00Z", updatedAt: "2026-06-10T10:00:00Z" },
  { id: "e-len-1", subjectId: "subj-len", period: "2026-1", name: "Comprensión lectora", evaluationDate: "2026-04-18", weight: 30, createdAt: "2026-04-19T08:30:00Z", updatedAt: "2026-04-19T08:30:00Z" },
  { id: "e-len-2", subjectId: "subj-len", period: "2026-1", name: "Ensayo argumentativo", evaluationDate: "2026-05-22", weight: 40, createdAt: "2026-05-23T15:20:00Z", updatedAt: "2026-05-23T15:20:00Z" },
  { id: "e-his-1", subjectId: "subj-his", period: "2026-1", name: "Prueba: civilizaciones", evaluationDate: "2026-04-24", weight: 35, createdAt: "2026-04-25T12:00:00Z", updatedAt: "2026-04-25T12:00:00Z" },
]

/* Constructor de notas con timestamps por defecto. */
let gid = 0
const G = (
  evaluationId: string,
  studentId: string,
  score: number,
  createdAt = "2026-04-12T10:00:00Z",
  updatedAt?: string
): Grade => ({
  id: "g" + ++gid,
  evaluationId,
  studentId,
  score,
  createdAt,
  updatedAt: updatedAt ?? createdAt,
})

export const grades: Grade[] = [
  // e-mat-1 (11 de 12 — falta s12)
  G("e-mat-1", "s1", 6.5), G("e-mat-1", "s2", 5.8), G("e-mat-1", "s3", 4.2),
  G("e-mat-1", "s4", 3.4), G("e-mat-1", "s5", 7.0), G("e-mat-1", "s6", 5.1),
  G("e-mat-1", "s7", 6.2), G("e-mat-1", "s8", 4.8), G("e-mat-1", "s9", 5.5),
  G("e-mat-1", "s10", 2.9, "2026-04-12T10:00:00Z", "2026-04-20T17:30:00Z"), G("e-mat-1", "s11", 6.8),
  // e-mat-2 (control corto)
  G("e-mat-2", "s1", 7.0), G("e-mat-2", "s2", 6.1), G("e-mat-2", "s3", 5.0),
  G("e-mat-2", "s4", 4.0), G("e-mat-2", "s5", 6.7), G("e-mat-2", "s6", 5.6),
  G("e-mat-2", "s7", 6.5), G("e-mat-2", "s8", 5.2), G("e-mat-2", "s9", 6.0),
  G("e-mat-2", "s10", 3.8), G("e-mat-2", "s11", 7.0), G("e-mat-2", "s12", 4.5),
  // e-mat-3 (trabajo grupal — notas más altas)
  G("e-mat-3", "s1", 6.8), G("e-mat-3", "s2", 6.8), G("e-mat-3", "s3", 6.0),
  G("e-mat-3", "s4", 5.5), G("e-mat-3", "s5", 6.5), G("e-mat-3", "s6", 6.0),
  G("e-mat-3", "s7", 6.5), G("e-mat-3", "s8", 5.5), G("e-mat-3", "s9", 6.2),
  G("e-mat-3", "s10", 5.0), G("e-mat-3", "s11", 6.8), G("e-mat-3", "s12", 5.5),
  // e-mat-4 (prueba reciente — faltan algunas, s5 y s7 sin nota)
  G("e-mat-4", "s1", 5.9), G("e-mat-4", "s2", 5.2), G("e-mat-4", "s3", 3.9),
  G("e-mat-4", "s4", 4.5), G("e-mat-4", "s6", 4.7),
  G("e-mat-4", "s8", 4.1, "2026-06-02T09:00:00Z", "2026-06-05T11:15:00Z"), G("e-mat-4", "s9", 5.8),
  G("e-mat-4", "s10", 3.5), G("e-mat-4", "s11", 6.4),
  // e-len-1
  G("e-len-1", "s1", 6.0), G("e-len-1", "s2", 5.5), G("e-len-1", "s3", 6.3),
  G("e-len-1", "s4", 4.8), G("e-len-1", "s5", 6.9), G("e-len-1", "s6", 5.0),
  // e-len-2
  G("e-len-2", "s1", 5.7), G("e-len-2", "s2", 6.0), G("e-len-2", "s3", 5.9),
  // e-his-1
  G("e-his-1", "s1", 5.2), G("e-his-1", "s2", 4.6), G("e-his-1", "s3", 6.1),
  G("e-his-1", "s4", 3.7), G("e-his-1", "s5", 5.8),
]

/**
 * Log de auditoría de notas (BE-ASS-003, inmutable). Una entrada por cada cambio;
 * el alta lleva `oldValue = null`. Indexado por id de nota.
 */
export const auditByGrade: AuditByGrade = {
  // s10 en e-mat-1: alta y posterior corrección
  g10: [
    { id: "a1", oldValue: null, newValue: 3.2, changedBy: "u-rojas", changedAt: "2026-04-12T10:02:00Z" },
    { id: "a2", oldValue: 3.2, newValue: 2.9, changedBy: "u-utp", changedAt: "2026-04-20T17:30:00Z" },
  ],
  // s8 en e-mat-4: alta y corrección al alza
  g42: [
    { id: "a3", oldValue: null, newValue: 3.8, changedBy: "u-rojas", changedAt: "2026-06-02T09:00:00Z" },
    { id: "a4", oldValue: 3.8, newValue: 4.1, changedBy: "u-rojas", changedAt: "2026-06-05T11:15:00Z" },
  ],
}
