// ── Recurso Asistencia ────────────────────────────────────────────────
// Llamadas al BFF (`/bff/asistencia/*`), que fan-outea a MS-Course +
// MS-Student y proxea mutaciones a MS-Attendance. Devuelven `Result`.

import { api } from '@/api/client'
import type { HttpTransport } from '@/api/http-transport'
import type { HttpFailure } from '@/api/http-client'
import type { ErrorResponse } from '@/api/errors'
import type { Result } from '@/api/result'

export type ApiResult<T> = Result<T, HttpFailure<ErrorResponse>>

const BASE = '/bff/asistencia'

// ── Shapes de respuesta del backend ──────────────────────────────────

/** Curso tal como lo devuelve MS-Course vía el composite. */
export interface ApiCourse {
  id: string
  name: string
  description?: string
  level?: string
  section?: string
  academicYear?: number
  status?: string
}

/** Alumno tal como lo devuelve MS-Student (vistas Base/List). */
export interface ApiStudent {
  id: string
  rut: string
  firstName: string
  lastName: string
  courseId: string
}

/** Bundle del composite GET /bff/asistencia/:courseId. */
export interface AsistenciaBundle {
  course: ApiCourse
  students: ApiStudent[]
  sessions: []
}

/** Sesión tal como la devuelve MS-Attendance (envuelta en ApiResponse<T>). */
export interface ApiSession {
  id: string
  classId: string
  teacherId: string
  status: string
  sessionDate: string
  closedAt: string | null
  createdAt: string
}

// ── Composite ─────────────────────────────────────────────────────────

export function getAsistenciaBundle(
  courseId: string,
  client: HttpTransport = api,
): Promise<ApiResult<AsistenciaBundle>> {
  return client.get<AsistenciaBundle, ErrorResponse>(`${BASE}/${courseId}`)
}

// ── Sesiones ──────────────────────────────────────────────────────────

export function openSession(
  courseId: string,
  classId: string,
  client: HttpTransport = api,
): Promise<ApiResult<{ data: ApiSession }>> {
  return client.post<{ data: ApiSession }, ErrorResponse>(
    `${BASE}/${courseId}/sessions`,
    { classId },
  )
}

export function closeSession(
  courseId: string,
  sessionId: string,
  client: HttpTransport = api,
): Promise<ApiResult<{ data: ApiSession }>> {
  return client.patch<{ data: ApiSession }, ErrorResponse>(
    `${BASE}/${courseId}/sessions/${sessionId}/close`,
    {},
  )
}

// ── Registros de asistencia ───────────────────────────────────────────

export type AttStatus = 'PRESENT' | 'ABSENT' | 'JUSTIFIED'

export function createRecord(
  courseId: string,
  sessionId: string,
  studentId: string,
  status: AttStatus,
  recordedAt: string,
  client: HttpTransport = api,
): Promise<ApiResult<{ data: unknown }>> {
  return client.post<{ data: unknown }, ErrorResponse>(
    `${BASE}/${courseId}/sessions/${sessionId}/records`,
    { studentId, status, captureMethod: 'MANUAL', recordedAt },
  )
}
