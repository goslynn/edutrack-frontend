import { useCallback, useEffect, useState } from 'react'

import {
  createAnnotation as createAnnotationApi,
  deleteAnnotation as deleteAnnotationApi,
  getAnotacionesBundle,
  type ApiStudent,
} from '@/api/anotaciones'
import { failureToError } from '@/api/errors'
import type { HttpFailure } from '@/api/http-client'
import type { ErrorResponse } from '@/api/errors'
import type { Annotation, AnnotationType, RosterStudent, Teacher } from '@/types/anotaciones'
import { getCurrentUserId } from '@/lib/session'
import { useAuth } from '@/context/AuthContext'

const toMsg = (f: HttpFailure<ErrorResponse>): string => failureToError(f).message

function toRosterEntry(s: ApiStudent): RosterStudent {
  return { id: s.id, name: `${s.lastName}, ${s.firstName}` }
}

export interface UseAnotacionesReturn {
  annotations: Annotation[]
  roster: RosterStudent[]
  currentTeacher: Teacher
  today: string
  loading: boolean
  error: string | null
  /**
   * Registra una nueva anotación vía API y la prepende a la lista.
   * Lanza un Error con el mensaje de fallo si la API responde con error.
   */
  createAnnotation: (studentId: string, type: AnnotationType, content: string, date: string) => Promise<Annotation>
  /**
   * Borra lógicamente la anotación (DELETE /annotations/:id).
   * Devuelve null en éxito o el mensaje de error.
   */
  deleteAnnotation: (id: string) => Promise<string | null>
  reload: () => Promise<void>
}

/** Fecha ISO de hoy en zona local, formato "YYYY-MM-DD". */
function todayIso(): string {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

export function useAnotaciones(courseId: string): UseAnotacionesReturn {
  const { user } = useAuth()
  const currentUserId = getCurrentUserId()

  const currentTeacher: Teacher = {
    id: currentUserId ?? '',
    name: user?.displayName ?? 'Docente',
  }

  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [roster, setRoster] = useState<RosterStudent[]>([])
  const [rosterMap, setRosterMap] = useState<Map<string, string>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [today] = useState(todayIso)

  const buildAnnotation = useCallback(
    (a: { id: string; studentId: string; teacherId: string; type: string; content: string; date: string }, map: Map<string, string>): Annotation => ({
      id: a.id,
      studentId: a.studentId,
      student: map.get(a.studentId) ?? 'Alumno',
      // Resolve author: if it's the current user show their display name, else generic.
      author: a.teacherId === currentUserId ? currentTeacher.name : 'Docente',
      type: a.type as AnnotationType,
      content: a.content,
      date: a.date,
      guardianNotified: a.type === 'NEGATIVE',
    }),
    [currentUserId, currentTeacher.name],
  )

  const load = useCallback(async () => {
    const res = await getAnotacionesBundle(courseId)
    if (!res.ok) {
      setError(toMsg(res.error))
      setLoading(false)
      return
    }

    const { roster: apiRoster, annotations: apiAnnotations } = res.value
    const sorted = [...apiRoster].sort((a, b) =>
      a.lastName.localeCompare(b.lastName, 'es') || a.firstName.localeCompare(b.firstName, 'es'),
    )
    const map = new Map(sorted.map((s) => [s.id, `${s.lastName}, ${s.firstName}`]))

    setRosterMap(map)
    setRoster(sorted.map(toRosterEntry))
    setAnnotations(apiAnnotations.map((a) => buildAnnotation(a, map)))
    setError(null)
    setLoading(false)
  }, [courseId, buildAnnotation])

  const reload = useCallback(async () => {
    setLoading(true)
    await load()
  }, [load])

  useEffect(() => {
    setLoading(true)
    void load()
  }, [load])

  // ── Mutaciones ────────────────────────────────────────────────────────

  const createAnnotation = useCallback(
    async (studentId: string, type: AnnotationType, content: string, date: string): Promise<Annotation> => {
      const res = await createAnnotationApi({ studentId, type, content, date })
      if (!res.ok) throw new Error(toMsg(res.error))
      const anno = buildAnnotation(res.value, rosterMap)
      setAnnotations((prev) => [anno, ...prev])
      return anno
    },
    [buildAnnotation, rosterMap],
  )

  const deleteAnnotation = useCallback(
    async (id: string): Promise<string | null> => {
      const res = await deleteAnnotationApi(id)
      if (!res.ok) return toMsg(res.error)
      setAnnotations((prev) => prev.filter((a) => a.id !== id))
      return null
    },
    [],
  )

  return {
    annotations,
    roster,
    currentTeacher,
    today,
    loading,
    error,
    createAnnotation,
    deleteAnnotation,
    reload,
  }
}
