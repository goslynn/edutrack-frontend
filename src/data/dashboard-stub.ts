/**
 * Datos de muestra (stub) del dashboard. Forma "JSON plana": solo datos, sin
 * lógica ni dependencias. En la app real esto llega desde los microservicios
 * (Course / Attendance / Assessment / Annotation) vía hooks contenedores — aquí
 * lo inyecta la página mientras esos endpoints no están cableados. Los tipos
 * viven en `@/types/dashboard`.
 */

import type { CurrentUser, DashboardData } from "@/types/dashboard"

/** Identidad de muestra; en la app real viene del JWT decodificado (Auth). */
export const currentUserStub: CurrentUser = {
  name: "María Rojas",
  email: "m.rojas@colegio.cl",
}

export const dashboardStub: DashboardData = {
  today: {
    greeting: "Buenos días, María",
    dateLabel: "Jueves, 12 de junio",
    summary: "Tienes 4 clases hoy · 6° Básico B es tu curso jefatura.",
  },

  courses: [
    { id: "6b", name: "6° Básico B", role: "Jefatura", students: 34, avg: 5.9, attendance: 92 },
    { id: "8a", name: "8° Básico A", role: "Lenguaje", students: 31, avg: 5.6, attendance: 88 },
    { id: "1mc", name: "1° Medio C", role: "Lenguaje", students: 38, avg: 5.4, attendance: 90 },
  ],

  // Stats rápidos del curso actual (valores de 6° Básico B).
  stats: [
    { id: "estudiantes", icon: "users", tint: "primary", label: "Estudiantes", value: "34", sub: "1 nuevo este mes" },
    { id: "promedio", icon: "graduation-cap", tint: "accent", label: "Promedio del curso", value: "5,9", delta: "+0,2", tone: "up", sub: "vs. Unidad 1" },
    { id: "asistencia", icon: "calendar-check", tint: "success", label: "Asistencia del mes", value: "92%", delta: "-1,5", tone: "down", sub: "vs. mes anterior" },
    { id: "anotaciones", icon: "message-square-text", tint: "warning", label: "Anotaciones (mes)", value: "18", sub: "12 positivas · 6 negativas" },
  ],

  // Promedio del curso por unidad (escala 1,0–7,0).
  avgTrend: [
    { label: "U1", value: 5.5 },
    { label: "U2", value: 5.6 },
    { label: "U3", value: 5.7 },
    { label: "U4", value: 5.9 },
  ],

  // Distribución de notas (rangos en escala chilena); `tone` codifica aprobado/reprobado.
  gradeDist: [
    { label: "1–2", count: 0, tone: "low" },
    { label: "2–3", count: 1, tone: "low" },
    { label: "3–4", count: 3, tone: "low" },
    { label: "4–5", count: 6, tone: "mid" },
    { label: "5–6", count: 13, tone: "high" },
    { label: "6–7", count: 11, tone: "high" },
  ],

  // Asistencia semanal (% presentes por día).
  attendanceWeek: [
    { label: "Lun", value: 94 },
    { label: "Mar", value: 91 },
    { label: "Mié", value: 96 },
    { label: "Jue", value: 89 },
    { label: "Vie", value: 92 },
  ],

  // Accesos directos: mezcla de contexto (clase en curso), pendientes y tareas.
  shortcuts: [
    { id: "asistencia-now", kind: "now", icon: "calendar-check", title: "Pasar asistencia", meta: "8° Básico A · Sala 7 · ahora", badge: "En curso", target: "asistencia" },
    { id: "publicar-notas", kind: "pending", icon: "send", title: "Publicar notas — Prueba U2", meta: "34 notas listas para enviar", badge: "Pendiente", target: "calificaciones" },
    { id: "revisar-anotaciones", kind: "pending", icon: "message-square-text", title: "Revisar anotaciones", meta: "3 anotaciones por aprobar", badge: "3", target: "anotaciones" },
  ],

  // Acciones frecuentes (chips).
  quickActions: [
    { id: "nueva-eval", icon: "clipboard-plus", label: "Nueva evaluación", target: "evaluaciones" },
    { id: "nueva-anotacion", icon: "message-square-plus", label: "Nueva anotación", target: "anotaciones" },
    { id: "exportar", icon: "download", label: "Exportar informe", target: "reportes" },
    { id: "subir-contenido", icon: "book-open", label: "Subir contenido", target: "contenidos" },
  ],

  // Notificaciones recientes (campana del topbar).
  notifications: [
    { id: "n1", tone: "warning", tag: "Asistencia", text: "Falta registrar asistencia de 1° Medio C." },
    { id: "n2", tone: "success", tag: "Notas", text: "Se publicaron las notas de la Prueba U2." },
    { id: "n3", tone: "primary", tag: "Reporte", text: "El informe de fin de semestre está disponible." },
  ],
}
