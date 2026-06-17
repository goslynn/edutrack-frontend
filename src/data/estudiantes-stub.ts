/**
 * Datos de muestra (stub) de la pantalla «Estudiantes y cursos». Modela los
 * microservicios MS-Student y MS-Course; en producción llega del backend vía API
 * Gateway y hooks contenedores — aquí lo inyecta la página. Solo datos: los tipos
 * viven en `@/types/estudiantes` y los mapas/validadores de presentación en la
 * capa de componentes (`estudiantes-meta`).
 *
 * RBAC se modela como un estado por acción: "enabled" | "disabled" | "hidden".
 * Lo resuelve el backend (auth) por usuario; la UI nunca explica el porqué.
 */

import type { Course, Guardian, PermMap, RelationType, Student } from "@/types/estudiantes"

/**
 * Mapa de permisos del usuario en sesión. El rol lo resuelve la capa de auth y
 * es opaco para la UI; aquí se fija el del usuario autenticado (administrador).
 */
export const perms: PermMap = {
  "students.create": "enabled",
  "students.edit": "enabled",
  "students.transfer": "enabled",
  "students.delete": "enabled",
  "courses.create": "enabled",
  "courses.edit": "enabled",
  "courses.delete": "enabled",
}

export const courses: Course[] = [
  { id: "c1", name: "1° Medio A", level: "1° Medio", section: "A", academicYear: 2026, description: "Jefatura de María Rojas. Plan común.", status: "ACTIVE" },
  { id: "c2", name: "1° Medio B", level: "1° Medio", section: "B", academicYear: 2026, description: "Plan común.", status: "ACTIVE" },
  { id: "c3", name: "2° Medio A", level: "2° Medio", section: "A", academicYear: 2026, description: "Electivo de ciencias.", status: "ACTIVE" },
  { id: "c4", name: "8° Básico A", level: "8° Básico", section: "A", academicYear: 2026, description: "Jefatura de Sebastián Riquelme.", status: "ACTIVE" },
  { id: "c5", name: "7° Básico B", level: "7° Básico", section: "B", academicYear: 2026, description: "", status: "ACTIVE" },
  { id: "c6", name: "4° Medio A", level: "4° Medio", section: "A", academicYear: 2025, description: "Curso egresado 2025.", status: "DELETED" },
]

const g = (
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  relationType: RelationType
): Guardian => ({ firstName, lastName, email, phone, relationType })

export const students: Student[] = [
  { id: "s1", rut: "21.345.678-5", firstName: "Sofía", lastName: "Contreras Díaz", birthDate: "2011-04-12", courseId: "c1", status: "ACTIVE",
    guardians: [g("Patricia", "Díaz", "patricia.diaz@mail.cl", "+56 9 8123 4567", "PARENT")] },
  { id: "s2", rut: "21.456.789-0", firstName: "Matías", lastName: "Fernández Soto", birthDate: "2011-09-03", courseId: "c1", status: "ACTIVE",
    guardians: [g("Rodrigo", "Fernández", "rodrigo.fernandez@mail.cl", "+56 9 7654 3210", "PARENT"), g("Carmen", "Soto", "carmen.soto@mail.cl", "", "PARENT")] },
  { id: "s3", rut: "21.567.890-K", firstName: "Antonia", lastName: "Muñoz Rivas", birthDate: "2011-01-27", courseId: "c1", status: "ACTIVE",
    guardians: [g("Verónica", "Rivas", "veronica.rivas@mail.cl", "+56 9 5551 2233", "GUARDIAN")] },
  { id: "s4", rut: "21.678.901-2", firstName: "Benjamín", lastName: "Araya Pérez", birthDate: "2011-06-18", courseId: "c2", status: "ACTIVE",
    guardians: [g("Luis", "Araya", "luis.araya@mail.cl", "+56 9 4412 9087", "PARENT")] },
  { id: "s5", rut: "21.789.012-3", firstName: "Florencia", lastName: "Vega Castro", birthDate: "2011-11-30", courseId: "c2", status: "ACTIVE",
    guardians: [g("Marcela", "Castro", "marcela.castro@mail.cl", "+56 9 3398 5510", "PARENT")] },
  { id: "s6", rut: "20.890.123-4", firstName: "Tomás", lastName: "Reyes Lagos", birthDate: "2010-02-14", courseId: "c3", status: "ACTIVE",
    guardians: [g("Andrés", "Reyes", "andres.reyes@mail.cl", "+56 9 2241 6678", "PARENT")] },
  { id: "s7", rut: "20.901.234-5", firstName: "Isidora", lastName: "Navarro Bravo", birthDate: "2010-08-22", courseId: "c3", status: "TRANSFERRED",
    guardians: [g("Paula", "Bravo", "paula.bravo@mail.cl", "+56 9 6677 1199", "TUTOR")] },
  { id: "s8", rut: "22.012.345-6", firstName: "Vicente", lastName: "Espinoza Rojas", birthDate: "2012-05-09", courseId: "c4", status: "ACTIVE",
    guardians: [g("Claudia", "Rojas", "claudia.rojas@mail.cl", "+56 9 8890 3344", "PARENT")] },
  { id: "s9", rut: "22.123.456-7", firstName: "Emilia", lastName: "Cárdenas Mora", birthDate: "2012-12-01", courseId: "c4", status: "ACTIVE",
    guardians: [g("Felipe", "Cárdenas", "felipe.cardenas@mail.cl", "+56 9 1122 7788", "PARENT")] },
  { id: "s10", rut: "22.234.567-8", firstName: "Joaquín", lastName: "Salazar Vidal", birthDate: "2013-03-25", courseId: "c5", status: "ACTIVE",
    guardians: [g("Daniela", "Vidal", "daniela.vidal@mail.cl", "", "GUARDIAN")] },
  { id: "s11", rut: "22.345.678-9", firstName: "Catalina", lastName: "Herrera Pinto", birthDate: "2013-07-16", courseId: "c5", status: "ACTIVE",
    guardians: [g("Jorge", "Herrera", "jorge.herrera@mail.cl", "+56 9 9001 2345", "PARENT")] },
  { id: "s12", rut: "20.456.789-0", firstName: "Agustín", lastName: "Cortés Fuentes", birthDate: "2009-10-05", courseId: "c3", status: "DELETED",
    guardians: [g("Sandra", "Fuentes", "sandra.fuentes@mail.cl", "+56 9 5566 7788", "PARENT")] },
]
