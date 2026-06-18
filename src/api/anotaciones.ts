// ── Recurso Anotaciones ───────────────────────────────────────────────
// Llamadas al BFF (`/bff/anotaciones/*`), que fan-outea a MS-Student +
// MS-Annotation y proxea mutaciones a MS-Annotation. Devuelven `Result`.

import { api } from '@/api/client'
import type { HttpTransport } from '@/api/http-transport'
import type { HttpFailure } from '@/api/http-client'
import type { ErrorResponse } from '@/api/errors'
import type { Result } from '@/api/result'

export type ApiResult<T> = Result<T, HttpFailure<ErrorResponse>>

const BASE = '/bff/anotaciones'

// ── Shapes de respuesta del backend ──────────────────────────────────

/** Alumno tal como lo devuelve MS-Student (vista Base). */
export interface ApiStudent {
  id: string
  firstName: string
  lastName: string
  rut: string
  courseId?: string
}

/**
 * Anotación tal como la devuelve MS-Annotation (vista Base/List).
 * Solo contiene UUIDs — la resolución de nombres ocurre en el hook.
 */
export interface ApiAnnotation {
  id: string
  studentId: string
  teacherId: string
  type: 'POSITIVE' | 'NEGATIVE'
  content: string
  date: string
}

/** Bundle del composite GET /bff/anotaciones/:courseId. */
export interface AnotacionesBundle {
  annotations: ApiAnnotation[]
  roster: ApiStudent[]
}

// ── Composite ─────────────────────────────────────────────────────────

export function getAnotacionesBundle(
  courseId: string,
  client: HttpTransport = api,
): Promise<ApiResult<AnotacionesBundle>> {
  return client.get<AnotacionesBundle, ErrorResponse>(`${BASE}/${courseId}`)
}

// ── Mutaciones ────────────────────────────────────────────────────────

export interface AnnotationCreateBody {
  studentId: string
  type: string
  content: string
  date: string
}

export function createAnnotation(
  body: AnnotationCreateBody,
  client: HttpTransport = api,
): Promise<ApiResult<ApiAnnotation>> {
  return client.post<ApiAnnotation, ErrorResponse>(`${BASE}/annotations`, body)
}

export function deleteAnnotation(
  id: string,
  client: HttpTransport = api,
): Promise<ApiResult<void>> {
  return client.delete<void, ErrorResponse>(`${BASE}/annotations/${id}`, { responseType: 'none' })
}
