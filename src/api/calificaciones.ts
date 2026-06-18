// ── Recurso Calificaciones ────────────────────────────────────────────
// Llamadas al BFF (`/bff/calificaciones/*`), que fan-outea a MS-Course +
// MS-Student + MS-Assessment y proxea mutaciones a MS-Assessment.

import { api } from '@/api/client'
import type { HttpTransport } from '@/api/http-transport'
import type { HttpFailure } from '@/api/http-client'
import type { ErrorResponse } from '@/api/errors'
import type { Result } from '@/api/result'

export type ApiResult<T> = Result<T, HttpFailure<ErrorResponse>>

const BASE = '/bff/calificaciones'

// ── Shapes de respuesta del backend ──────────────────────────────────

export interface ApiSubject {
  id: string
  name: string
  course: string
  teacher: string
}

export interface ApiStudent {
  id: string
  firstName: string
  lastName: string
  rut: string
  courseId?: string
}

export interface ApiEvaluation {
  id: string
  name: string
  evaluationDate: string
  weight: number
  subjectId: string
  period: string
  createdAt?: string
  updatedAt?: string
}

export interface ApiGrade {
  id: string
  evaluationId: string
  studentId: string
  score: number
  createdAt?: string
  updatedAt?: string
}

export interface ApiGradeAuditLog {
  id: string
  gradeId: string
  studentId: string
  evaluationId: string
  oldValue: number | null
  newValue: number
  changedBy: string
  changedAt: string
}

export interface CalificacionesBundle {
  subjects: ApiSubject[]
  students: ApiStudent[]
}

export interface EvalBundle {
  courseId: string
  subjectId: string
  period: string
  evaluations: ApiEvaluation[]
  grades: ApiGrade[]
}

// ── Composites ────────────────────────────────────────────────────────

export function getCalificacionesBundle(
  courseId: string,
  client: HttpTransport = api,
): Promise<ApiResult<CalificacionesBundle>> {
  return client.get<CalificacionesBundle, ErrorResponse>(`${BASE}/${courseId}`)
}

export function getEvalBundle(
  courseId: string,
  subjectId: string,
  period: string,
  client: HttpTransport = api,
): Promise<ApiResult<EvalBundle>> {
  const qs = `?period=${encodeURIComponent(period)}`
  return client.get<EvalBundle, ErrorResponse>(
    `${BASE}/${courseId}/subjects/${subjectId}/evaluations${qs}`,
  )
}

// ── Evaluation CRUD ───────────────────────────────────────────────────

export interface EvaluationCreateBody {
  name: string
  evaluationDate: string
  weight: number
  subjectId: string
  period: string
}

export function createEvaluation(
  body: EvaluationCreateBody,
  client: HttpTransport = api,
): Promise<ApiResult<ApiEvaluation>> {
  return client.post<ApiEvaluation, ErrorResponse>(`${BASE}/evaluations`, body)
}

export interface EvaluationUpdateBody {
  name?: string
  evaluationDate?: string
  weight?: number
}

export function updateEvaluation(
  id: string,
  body: EvaluationUpdateBody,
  client: HttpTransport = api,
): Promise<ApiResult<ApiEvaluation>> {
  return client.put<ApiEvaluation, ErrorResponse>(`${BASE}/evaluations/${id}`, body)
}

export function deleteEvaluation(
  id: string,
  client: HttpTransport = api,
): Promise<ApiResult<void>> {
  return client.delete<void, ErrorResponse>(`${BASE}/evaluations/${id}`, { responseType: 'none' })
}

// ── Grade CRUD ────────────────────────────────────────────────────────

export function registerGrade(
  evaluationId: string,
  studentId: string,
  score: number,
  client: HttpTransport = api,
): Promise<ApiResult<ApiGrade>> {
  return client.post<ApiGrade, ErrorResponse>(
    `${BASE}/evaluations/${evaluationId}/grades`,
    { studentId, score },
  )
}

export function correctGrade(
  gradeId: string,
  score: number,
  client: HttpTransport = api,
): Promise<ApiResult<ApiGrade>> {
  return client.put<ApiGrade, ErrorResponse>(`${BASE}/grades/${gradeId}`, { score })
}

export function getGradeHistory(
  gradeId: string,
  client: HttpTransport = api,
): Promise<ApiResult<ApiGradeAuditLog[]>> {
  return client.get<ApiGradeAuditLog[], ErrorResponse>(`${BASE}/grades/${gradeId}/audit`)
}
