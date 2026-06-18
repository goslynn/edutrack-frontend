// ── Recurso Estudiantes / Cursos ──────────────────────────────────────
// Llamadas al BFF (`/bff/estudiantes/*`), que proxea a MS-Student y
// MS-Course. El composite GET devuelve alumnos + cursos + apoderados en
// un solo round-trip. Las mutaciones van por rutas individuales.
// Todas devuelven `Result`; la capa de hooks decide cómo mostrar el fallo.

import { api } from '@/api/client'
import type { HttpTransport } from '@/api/http-transport'
import type { HttpFailure } from '@/api/http-client'
import type { ErrorResponse } from '@/api/errors'
import type { Result } from '@/api/result'
import type { Course, Guardian, Student } from '@/types/estudiantes'

export type ApiResult<T> = Result<T, HttpFailure<ErrorResponse>>

const BASE = '/bff/estudiantes'

// ── Tipos de request ──────────────────────────────────────────────────

interface StudentCreateBody {
  rut: string
  firstName: string
  lastName: string
  birthDate: string
  courseId: string
}

interface StudentUpdateBody {
  firstName: string
  lastName: string
  birthDate: string
}

interface StudentTransferBody {
  courseId: string
}

interface GuardianCreateBody {
  firstName: string
  lastName: string
  email: string
  phone: string
  relationType: string
}

interface CourseBody {
  name: string
  description: string
  level: string
  section: string
  academicYear: number
}

// ── Bundle composite ──────────────────────────────────────────────────

// El BFF enriquece cada alumno con sus apoderados en el mismo round-trip.
export interface EstudiantesBundle {
  students: Student[]
  courses: Course[]
}

export function getEstudiantesBundle(
  client: HttpTransport = api,
): Promise<ApiResult<EstudiantesBundle>> {
  return client.get<EstudiantesBundle, ErrorResponse>(BASE)
}

// Lista ligera de cursos (sin alumnos): para el selector del topbar.
export function listCourses(
  client: HttpTransport = api,
): Promise<ApiResult<Course[]>> {
  return client.get<Course[], ErrorResponse>(`${BASE}/courses`)
}

// ── Student CRUD ──────────────────────────────────────────────────────

export function createStudent(
  body: StudentCreateBody,
  client: HttpTransport = api,
): Promise<ApiResult<Student>> {
  return client.post<Student, ErrorResponse>(`${BASE}/students`, body)
}

export function updateStudent(
  id: string,
  body: StudentUpdateBody,
  client: HttpTransport = api,
): Promise<ApiResult<Student>> {
  return client.put<Student, ErrorResponse>(`${BASE}/students/${id}`, body)
}

export function deleteStudent(
  id: string,
  client: HttpTransport = api,
): Promise<ApiResult<void>> {
  return client.delete<void, ErrorResponse>(`${BASE}/students/${id}`, { responseType: 'none' })
}

export function transferStudent(
  id: string,
  body: StudentTransferBody,
  client: HttpTransport = api,
): Promise<ApiResult<Student>> {
  return client.patch<Student, ErrorResponse>(`${BASE}/students/${id}/transfer`, body)
}

// ── Guardian sub-resource ─────────────────────────────────────────────

export function listGuardians(
  studentId: string,
  client: HttpTransport = api,
): Promise<ApiResult<Guardian[]>> {
  return client.get<Guardian[], ErrorResponse>(`${BASE}/students/${studentId}/guardians`)
}

export function createGuardian(
  studentId: string,
  body: GuardianCreateBody,
  client: HttpTransport = api,
): Promise<ApiResult<Guardian>> {
  return client.post<Guardian, ErrorResponse>(`${BASE}/students/${studentId}/guardians`, body)
}

// ── Course CRUD ───────────────────────────────────────────────────────

export function createCourse(
  body: CourseBody,
  client: HttpTransport = api,
): Promise<ApiResult<Course>> {
  return client.post<Course, ErrorResponse>(`${BASE}/courses`, body)
}

export function updateCourse(
  id: string,
  body: CourseBody,
  client: HttpTransport = api,
): Promise<ApiResult<Course>> {
  return client.put<Course, ErrorResponse>(`${BASE}/courses/${id}`, body)
}

export function deleteCourse(
  id: string,
  client: HttpTransport = api,
): Promise<ApiResult<void>> {
  return client.delete<void, ErrorResponse>(`${BASE}/courses/${id}`, { responseType: 'none' })
}
