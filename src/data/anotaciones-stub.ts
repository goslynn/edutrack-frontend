/**
 * Datos de muestra (stub) de la pantalla de Anotaciones. En la app real esto
 * llega del Annotation microservice (cl.duocuc.edutrack.ms.annotation) vía hooks
 * contenedores; aquí lo inyecta la página mientras esos endpoints no están
 * cableados. Solo datos: los tipos viven en `@/types/anotaciones` y la
 * presentación (badges, formato de fecha, límites) en la capa de componentes.
 *
 * Reglas de dominio reflejadas en la UI:
 *   · El tipo es obligatorio (BE-ANN-001 → 422 si falta/no se reconoce).
 *   · Una anotación NEGATIVE notifica al apoderado (BE-ANN-002, evento async).
 *   · El docente autor (teacherId) lo propaga el Gateway, no el formulario.
 */

import type { Annotation, RosterStudent, Teacher } from "@/types/anotaciones"

/** Docente autenticado (identidad propagada por el Gateway). */
export const currentTeacher: Teacher = { id: "t-001", name: "María Rojas" }

/** Fecha de referencia del stub (ISO). */
export const TODAY = "2026-06-16"

function daysAgo(d: number, today = TODAY): string {
  const dt = new Date(today + "T00:00:00")
  dt.setDate(dt.getDate() - d)
  return dt.toISOString().slice(0, 10)
}

/** Curso de jefatura en contexto (la lista de alumnos del curso). */
export const roster: RosterStudent[] = [
  { id: "s1", name: "Araya Reyes, Florencia" },
  { id: "s2", name: "Bravo Soto, Joaquín" },
  { id: "s3", name: "Carrasco Vega, Antonia" },
  { id: "s4", name: "Castro Núñez, Benjamín" },
  { id: "s5", name: "Cortés Lagos, Emilia" },
  { id: "s6", name: "Espinoza Tapia, Vicente" },
  { id: "s7", name: "Fuentes Pérez, Martina" },
  { id: "s8", name: "González Silva, Diego" },
  { id: "s9", name: "Muñoz Araya, Catalina" },
  { id: "s10", name: "Núñez Pizarro, Tomás" },
  { id: "s11", name: "Pérez Cortés, Isidora" },
  { id: "s12", name: "Pizarro Bravo, Cristóbal" },
  { id: "s13", name: "Reyes Muñoz, Javiera" },
  { id: "s14", name: "Rojas Fuentes, Mateo" },
  { id: "s15", name: "Silva Vergara, Amanda" },
  { id: "s16", name: "Vergara Castro, Agustín" },
]

const s = (i: number) => roster[i]

/** Histórico semilla (vigentes: deletedAt = null). */
export const seedAnnotations: Annotation[] = [
  {
    id: "a1", studentId: s(2).id, student: s(2).name, author: "María Rojas",
    type: "POSITIVE",
    content: "Excelente disposición y liderazgo durante el trabajo grupal de la Unidad 3.",
    date: daysAgo(0), guardianNotified: false,
  },
  {
    id: "a2", studentId: s(7).id, student: s(7).name, author: "Pedro Araya",
    type: "NEGATIVE",
    content: "Interrumpe reiteradamente la clase pese a los llamados de atención.",
    date: daysAgo(0), guardianNotified: true,
  },
  {
    id: "a3", studentId: s(11).id, student: s(11).name, author: "María Rojas",
    type: "POSITIVE",
    content: "Mejora sostenida en comprensión lectora a lo largo del semestre.",
    date: daysAgo(1), guardianNotified: false,
  },
  {
    id: "a4", studentId: s(4).id, student: s(4).name, author: "María Rojas",
    type: "NEGATIVE",
    content: "No presenta los materiales solicitados por tercera clase consecutiva.",
    date: daysAgo(2), guardianNotified: true,
  },
  {
    id: "a5", studentId: s(9).id, student: s(9).name, author: "Pedro Araya",
    type: "POSITIVE",
    content: "Apoya a sus compañeros en la actividad de lectura, mostrando empatía.",
    date: daysAgo(3), guardianNotified: false,
  },
  {
    id: "a6", studentId: s(13).id, student: s(13).name, author: "María Rojas",
    type: "POSITIVE",
    content: "Entrega anticipada y muy completa del ensayo de la Unidad 2.",
    date: daysAgo(4), guardianNotified: false,
  },
  {
    id: "a7", studentId: s(6).id, student: s(6).name, author: "María Rojas",
    type: "NEGATIVE",
    content: "Uso de celular durante la evaluación pese a la advertencia inicial.",
    date: daysAgo(5), guardianNotified: true,
  },
]
