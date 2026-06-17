/**
 * Datos de muestra (stub) de la página de Asistencia. Forma "JSON plana": solo
 * datos. En la app real esto llega de los microservicios Attendance / Course /
 * Student vía hooks contenedores; aquí lo inyecta la página. Los tipos viven en
 * `@/types/asistencia` y los helpers de derivación en la capa de componentes
 * (`att-derive`).
 *
 * Un "registro" de una sesión cerrada es INMUTABLE por contrato de API (no existe
 * endpoint de edición): solo se consulta. Los permisos se modelan aparte como
 * estado `enabled | disabled | hidden` por acción — la única expresión de RBAC.
 */

import type {
  AsistenciaData,
  AttCourse,
  AttMonthStats,
  AttToday,
  CourseOption,
  HistorySession,
  Student,
} from "@/types/asistencia"

const course: AttCourse = {
  id: "6b",
  name: "6° Básico B",
  subject: "Lenguaje y Comunicación",
  room: "Sala 12",
  block: "3° bloque · 11:30–13:00",
  students: 30,
}

// Nómina — ordenada "Apellido Apellido, Nombre" como en el libro de clases.
const students: Student[] = [
  { n: 1, first: "Amanda", last: "Araya", name: "Araya Soto, Amanda", rut: "21.842.118-4" },
  { n: 2, first: "Vicente", last: "Bravo", name: "Bravo Núñez, Vicente", rut: "22.014.553-9" },
  { n: 3, first: "Catalina", last: "Carrasco", name: "Carrasco Vega, Catalina", rut: "21.778.902-1" },
  { n: 4, first: "Tomás", last: "Castro", name: "Castro Lagos, Tomás", rut: "22.155.640-7" },
  { n: 5, first: "Fernanda", last: "Cortés", name: "Cortés Pérez, Fernanda", rut: "21.903.471-K" },
  { n: 6, first: "Gaspar", last: "Espinoza", name: "Espinoza Rojas, Gaspar", rut: "22.067.219-3" },
  { n: 7, first: "Florencia", last: "Fuentes", name: "Fuentes Reyes, Florencia", rut: "21.690.884-6" },
  { n: 8, first: "Benjamín", last: "González", name: "González Silva, Benjamín", rut: "22.118.305-0" },
  { n: 9, first: "Emilia", last: "Herrera", name: "Herrera Tapia, Emilia", rut: "21.845.770-2" },
  { n: 10, first: "Joaquín", last: "Lagos", name: "Lagos Muñoz, Joaquín", rut: "22.201.964-8" },
  { n: 11, first: "Martina", last: "Muñoz", name: "Muñoz Araya, Martina", rut: "21.733.018-5" },
  { n: 12, first: "Cristóbal", last: "Núñez", name: "Núñez Castro, Cristóbal", rut: "22.090.447-1" },
  { n: 13, first: "Isidora", last: "Olivares", name: "Olivares Vergara, Isidora", rut: "21.812.336-9" },
  { n: 14, first: "Mateo", last: "Pérez", name: "Pérez Bravo, Mateo", rut: "22.176.058-4" },
  { n: 15, first: "Trinidad", last: "Pizarro", name: "Pizarro Fuentes, Trinidad", rut: "21.659.420-7" },
  { n: 16, first: "Lucas", last: "Reyes", name: "Reyes González, Lucas", rut: "22.143.781-2" },
  { n: 17, first: "Sofía", last: "Rojas", name: "Rojas Carrasco, Sofía", rut: "21.920.115-K" },
  { n: 18, first: "Diego", last: "Silva", name: "Silva Herrera, Diego", rut: "22.038.692-6" },
  { n: 19, first: "Valentina", last: "Soto", name: "Soto Olivares, Valentina", rut: "21.764.553-3" },
  { n: 20, first: "Agustín", last: "Tapia", name: "Tapia Pizarro, Agustín", rut: "22.219.847-1" },
  { n: 21, first: "Javiera", last: "Vega", name: "Vega Cortés, Javiera", rut: "21.887.260-8" },
  { n: 22, first: "Maximiliano", last: "Vergara", name: "Vergara Reyes, Maximiliano", rut: "22.101.534-5" },
  { n: 23, first: "Antonia", last: "Araya", name: "Araya Lagos, Antonia", rut: "21.701.998-2" },
  { n: 24, first: "Bruno", last: "Castro", name: "Castro Núñez, Bruno", rut: "22.188.073-9" },
  { n: 25, first: "Josefa", last: "Fuentes", name: "Fuentes Soto, Josefa", rut: "21.833.401-4" },
  { n: 26, first: "Matías", last: "González", name: "González Tapia, Matías", rut: "22.054.916-7" },
  { n: 27, first: "Constanza", last: "Muñoz", name: "Muñoz Vega, Constanza", rut: "21.749.620-0" },
  { n: 28, first: "Vicente", last: "Pérez", name: "Pérez Silva, Vicente", rut: "22.207.385-3" },
  { n: 29, first: "Renata", last: "Rojas", name: "Rojas Pizarro, Renata", rut: "21.876.142-6" },
  { n: 30, first: "Felipe", last: "Vega", name: "Vega Herrera, Felipe", rut: "22.120.778-K" },
]

const today: AttToday = {
  dateLabel: "Lunes 15 de junio",
  time: "11:30",
  taken: false,
}

// Sesiones recientes — la más nueva primero. Cada una es un registro CERRADO.
const history: HistorySession[] = [
  { id: "s-0612", dateLabel: "Viernes 12 de junio", dow: "Vie", short: "12 jun", time: "11:34", by: "M. Rojas", at: [8, 21], au: [3], ju: [16] },
  { id: "s-0611", dateLabel: "Jueves 11 de junio", dow: "Jue", short: "11 jun", time: "11:31", by: "M. Rojas", at: [5], au: [], ju: [] },
  { id: "s-0610", dateLabel: "Miércoles 10 de junio", dow: "Mié", short: "10 jun", time: "11:30", by: "M. Rojas", at: [12, 27], au: [9, 18], ju: [3] },
  { id: "s-0609", dateLabel: "Martes 9 de junio", dow: "Mar", short: "09 jun", time: "11:37", by: "P. Araya", at: [], au: [14], ju: [] },
  { id: "s-0608", dateLabel: "Lunes 8 de junio", dow: "Lun", short: "08 jun", time: "11:32", by: "M. Rojas", at: [2, 19, 30], au: [], ju: [25] },
  { id: "s-0605", dateLabel: "Viernes 5 de junio", dow: "Vie", short: "05 jun", time: "11:33", by: "M. Rojas", at: [21], au: [3, 9], ju: [] },
  { id: "s-0604", dateLabel: "Jueves 4 de junio", dow: "Jue", short: "04 jun", time: "11:30", by: "M. Rojas", at: [], au: [], ju: [16] },
  { id: "s-0603", dateLabel: "Miércoles 3 de junio", dow: "Mié", short: "03 jun", time: "11:35", by: "P. Araya", at: [7, 11], au: [18], ju: [] },
]

const monthStats: AttMonthStats = {
  pct: 93,
  deltaPct: "+1,2",
  sessions: 14,
  lateAvg: 1.4,
}

const courses: CourseOption[] = [
  { id: "6b", name: "6° Básico B", role: "Jefatura" },
  { id: "8a", name: "8° Básico A", role: "Lenguaje" },
  { id: "1mc", name: "1° Medio C", role: "Lenguaje" },
]

/**
 * Bundle de datos de la pantalla. Los permisos del usuario autenticado se
 * derivan en producción de la sesión (auth); aquí, perfil titular con acceso
 * completo. Mantener el shape `enabled | disabled | hidden` por acción.
 */
export const asistenciaData: AsistenciaData = {
  course,
  courses,
  students,
  today,
  history,
  monthStats,
  perms: { take: "enabled", export: "enabled", view: "enabled" },
}
