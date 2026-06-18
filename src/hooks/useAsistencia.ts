import { useCallback, useEffect, useState } from 'react'

import {
  closeSession as closeSessionApi,
  createRecord,
  getAsistenciaBundle,
  openSession as openSessionApi,
  type AttStatus,
} from '@/api/asistencia'
import { failureToError } from '@/api/errors'
import type { HttpFailure } from '@/api/http-client'
import type { ErrorResponse } from '@/api/errors'
import type { AsistenciaData, AttStatus as FrontStatus, Marks, Student } from '@/types/asistencia'

const toMsg = (f: HttpFailure<ErrorResponse>): string => failureToError(f).message

// ── Mapeo estado frontend → AttendanceStatus del backend ─────────────
// El MS solo tiene 3 estados (PRESENT, ABSENT, JUSTIFIED).
// "atrasado" se envía como PRESENT (sigue contando como asistencia).
function toApiStatus(s: FrontStatus): AttStatus {
  switch (s) {
    case 'presente':  return 'PRESENT'
    case 'atrasado':  return 'PRESENT'   // late = present for the API
    case 'ausente':   return 'ABSENT'
    case 'justificado': return 'JUSTIFIED'
  }
}

function toIsoDateTime(date: Date): string {
  return date.toISOString().replace('Z', '')  // LocalDateTime (no Z) para el backend
}

// ── Construcción de la nómina ──────────────────────────────────────────
// Ordena por apellido y asigna número de lista (n).
function buildRoster(apiStudents: Array<{ id: string; firstName: string; lastName: string; rut: string }>): Student[] {
  const sorted = [...apiStudents].sort((a, b) =>
    a.lastName.localeCompare(b.lastName, 'es') || a.firstName.localeCompare(b.firstName, 'es'),
  )
  return sorted.map((s, i) => ({
    id:    s.id,
    n:     i + 1,
    first: s.firstName,
    last:  s.lastName,
    name:  `${s.lastName}, ${s.firstName}`,
    rut:   s.rut,
  }))
}

// ── Helpers de fecha ───────────────────────────────────────────────────
function todayLabel(): string {
  return new Date().toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function capitalizeFirst(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s
}

const EMPTY_DATA: AsistenciaData = {
  course:     { id: '', name: '', subject: '', room: '', block: '', students: 0 },
  courses:    [],
  students:   [],
  today:      { dateLabel: capitalizeFirst(todayLabel()), time: '', taken: false },
  history:    [],
  monthStats: { pct: 0, deltaPct: '+0', sessions: 0, lateAvg: 0 },
  perms:      { take: 'enabled', export: 'disabled', view: 'enabled' },
}

// ── Estado del hook ────────────────────────────────────────────────────

interface UseAsistenciaState {
  data: AsistenciaData
  loading: boolean
  error: string | null
}

export interface UseAsistenciaReturn extends UseAsistenciaState {
  /**
   * Abre una sesión de asistencia vía API. Devuelve el sessionId o lanza
   * el mensaje de error.
   */
  openSession: () => Promise<string>
  /**
   * Cierra la sesión enviando todos los registros y haciendo PATCH /close.
   * Devuelve `null` en éxito o el mensaje de error.
   */
  closeSession: (sessionId: string, marks: Marks) => Promise<string | null>
  reload: () => Promise<void>
}

/**
 * Orquesta la carga y las mutaciones de la pantalla de Asistencia.
 * Recibe el `courseId` real (UUID de MS-Course) desde el contexto del layout.
 */
export function useAsistencia(courseId: string): UseAsistenciaReturn {
  const [state, setState] = useState<UseAsistenciaState>({
    data: EMPTY_DATA,
    loading: true,
    error: null,
  })

  const load = useCallback(async () => {
    const res = await getAsistenciaBundle(courseId)
    if (!res.ok) {
      setState((p) => ({ ...p, loading: false, error: toMsg(res.error) }))
      return
    }

    const { course, students: apiStudents } = res.value
    const roster = buildRoster(apiStudents)

    const data: AsistenciaData = {
      course: {
        id:       course.id,
        name:     course.name,
        subject:  course.description ?? course.name,
        room:     '',
        block:    '',
        students: roster.length,
      },
      courses:    [],
      students:   roster,
      today:      { dateLabel: capitalizeFirst(todayLabel()), time: '', taken: false },
      history:    [],
      monthStats: { pct: 0, deltaPct: '+0', sessions: 0, lateAvg: 0 },
      perms:      { take: 'enabled', export: 'disabled', view: 'enabled' },
    }
    setState({ data, loading: false, error: null })
  }, [courseId])

  const reload = useCallback(async () => {
    setState((p) => ({ ...p, loading: true }))
    await load()
  }, [load])

  useEffect(() => {
    let active = true
    void load().then(() => { if (!active) setState((p) => ({ ...p })) })
    return () => { active = false }
  }, [load])

  // ── Mutaciones ────────────────────────────────────────────────────────

  const openSession = useCallback(async (): Promise<string> => {
    const res = await openSessionApi(courseId, courseId)  // classId = courseId (UUID de MS-Course)
    if (!res.ok) throw new Error(toMsg(res.error))
    return res.value.data.id
  }, [courseId])

  const closeSession = useCallback(
    async (sessionId: string, marks: Marks): Promise<string | null> => {
      const now = toIsoDateTime(new Date())
      const students = state.data.students

      // Envía un registro por cada alumno en paralelo.
      const results = await Promise.all(
        students.map((s) => {
          const frontStatus = marks[s.n] ?? 'presente'
          // s.id es el UUID de MS-Student; s.rut es fallback defensivo.
          return createRecord(courseId, sessionId, s.id ?? s.rut, toApiStatus(frontStatus), now)
        }),
      )

      const failed = results.find((r) => !r.ok)
      if (failed && !failed.ok) return toMsg(failed.error)

      const closeRes = await closeSessionApi(courseId, sessionId)
      if (!closeRes.ok) return toMsg(closeRes.error)

      return null
    },
    [courseId, state.data.students],
  )

  return { ...state, openSession, closeSession, reload }
}
