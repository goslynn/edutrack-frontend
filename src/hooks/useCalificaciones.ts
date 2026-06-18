import { useCallback, useEffect, useRef, useState } from 'react'

import {
  getCalificacionesBundle,
  getEvalBundle,
  createEvaluation,
  updateEvaluation,
  deleteEvaluation,
  registerGrade,
  correctGrade,
  getGradeHistory,
  type ApiEvaluation,
  type ApiGrade,
  type ApiStudent,
  type ApiSubject,
} from '@/api/calificaciones'
import { failureToError } from '@/api/errors'
import type { HttpFailure } from '@/api/http-client'
import type { ErrorResponse } from '@/api/errors'
import type {
  AuditByGrade,
  Evaluation,
  Grade,
  GradeAuditEntry,
  PermMap,
  RosterStudent,
  Subject,
} from '@/types/calificaciones'
import { getCurrentUserId } from '@/lib/session'
import { useAuth } from '@/context/AuthContext'

type Flash = (variant: 'success' | 'info', msg: string) => void
const toMsg = (f: HttpFailure<ErrorResponse>): string => failureToError(f).message

// ── Shape mappers ─────────────────────────────────────────────────────

function toSubject(s: ApiSubject): Subject {
  return { id: s.id, name: s.name, course: s.course, teacher: s.teacher }
}

function toStudent(s: ApiStudent): RosterStudent {
  return { id: s.id, rut: s.rut, firstName: s.firstName, lastName: s.lastName }
}

function toEvaluation(e: ApiEvaluation): Evaluation {
  return {
    id: e.id,
    subjectId: e.subjectId,
    period: e.period,
    name: e.name,
    evaluationDate: e.evaluationDate,
    weight: e.weight,
    createdAt: e.createdAt ?? new Date().toISOString(),
    updatedAt: e.updatedAt ?? new Date().toISOString(),
  }
}

function toGrade(g: ApiGrade): Grade {
  return {
    id: g.id,
    evaluationId: g.evaluationId,
    studentId: g.studentId,
    score: g.score,
    createdAt: g.createdAt ?? new Date().toISOString(),
    updatedAt: g.updatedAt ?? new Date().toISOString(),
  }
}

// ── Default all-enabled perms (server-side RBAC, UI reflects it) ──────
const ALL_ENABLED: PermMap = {
  'evaluations.create': 'enabled',
  'evaluations.edit': 'enabled',
  'evaluations.delete': 'enabled',
  'grades.write': 'enabled',
  'audit.read': 'enabled',
}

const DEFAULT_PERIODS = ['2026-1', '2026-2']

export type Toast = { variant: 'success' | 'info'; msg: string; k: number } | null

export interface UseCalificacionesReturn {
  subjects: Subject[]
  students: RosterStudent[]
  periods: string[]
  perms: PermMap
  users: Record<string, string>
  evaluations: Evaluation[]
  grades: Grade[]
  audit: AuditByGrade
  subjectId: string
  period: string
  setSubjectId: (id: string) => void
  setPeriod: (p: string) => void
  loading: boolean
  evalLoading: boolean
  error: string | null
  toast: Toast
  flash: Flash
  onEvalChange: (updater: (prev: Evaluation[]) => Evaluation[]) => void
  onRegister: (evaluationId: string, studentId: string, score: number) => void
  onCorrect: (gradeId: string, score: number) => void
  loadAudit: (gradeId: string) => void
  onCreateEvalApi: (data: { name: string; evaluationDate: string; weight: number }) => Promise<Evaluation | null>
  onUpdateEvalApi: (id: string, data: { name: string; evaluationDate: string; weight: number }) => Promise<Evaluation | null>
  onDeleteEvalApi: (id: string) => Promise<boolean>
}

export function useCalificaciones(courseId: string): UseCalificacionesReturn {
  const { user } = useAuth()
  const currentUserId = getCurrentUserId()

  // users map: at minimum the current user's display name
  const [users, setUsers] = useState<Record<string, string>>(() =>
    currentUserId && user?.displayName ? { [currentUserId]: user.displayName } : {},
  )

  const [subjects, setSubjects] = useState<Subject[]>([])
  const [students, setStudents] = useState<RosterStudent[]>([])
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [audit, setAudit] = useState<AuditByGrade>({})

  const [subjectId, setSubjectId] = useState('')
  const [period, setPeriod] = useState(DEFAULT_PERIODS[0])
  const [periods, setPeriods] = useState<string[]>(DEFAULT_PERIODS)

  const [loading, setLoading] = useState(true)
  const [evalLoading, setEvalLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [toast, setToast] = useState<Toast>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const flash: Flash = useCallback((variant, msg) => {
    setToast({ variant, msg, k: Date.now() })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3200)
  }, [])

  // ── Bundle load (subjects + roster) ────────────────────────────────

  const loadBundle = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await getCalificacionesBundle(courseId)
    if (!res.ok) {
      setError(toMsg(res.error))
      setLoading(false)
      return
    }
    const { subjects: apiSubjects, students: apiStudents } = res.value
    const mappedSubjects = apiSubjects.map(toSubject)
    const sorted = [...apiStudents].sort(
      (a, b) => a.lastName.localeCompare(b.lastName, 'es') || a.firstName.localeCompare(a.firstName, 'es'),
    )
    setSubjects(mappedSubjects)
    setStudents(sorted.map(toStudent))
    if (mappedSubjects.length > 0) {
      setSubjectId(mappedSubjects[0].id)
    }
    setLoading(false)
  }, [courseId])

  useEffect(() => {
    void loadBundle()
  }, [loadBundle])

  // ── Eval bundle load (evaluations + grades) ─────────────────────────

  const loadEvalBundle = useCallback(async () => {
    if (!subjectId) return
    setEvalLoading(true)
    const res = await getEvalBundle(courseId, subjectId, period)
    if (!res.ok) {
      // 404 means no evaluations yet — treat as empty
      if ('status' in res.error && res.error.status === 404) {
        setEvaluations([])
        setGrades([])
      } else {
        flash('info', `Error cargando evaluaciones: ${toMsg(res.error)}`)
      }
      setEvalLoading(false)
      return
    }
    const { evaluations: apiEvals, grades: apiGrades } = res.value
    setEvaluations((apiEvals as ApiEvaluation[]).map(toEvaluation))
    setGrades((apiGrades as ApiGrade[]).map(toGrade))

    // Derive available periods from evaluations (union with defaults)
    const evalPeriods = [...new Set((apiEvals as ApiEvaluation[]).map((e) => e.period))]
    setPeriods((prev) => {
      const merged = [...new Set([...DEFAULT_PERIODS, ...evalPeriods, ...prev])]
      return merged.sort().reverse()
    })

    setEvalLoading(false)
  }, [courseId, subjectId, period, flash])

  useEffect(() => {
    void loadEvalBundle()
  }, [loadEvalBundle])

  // ── Audit lazy loader ────────────────────────────────────────────────

  const loadAudit = useCallback(
    (gradeId: string) => {
      void (async () => {
        const res = await getGradeHistory(gradeId)
        if (!res.ok) return
        const entries: GradeAuditEntry[] = res.value.map((entry) => ({
          id: entry.id,
          oldValue: entry.oldValue,
          newValue: entry.newValue,
          changedBy: entry.changedBy,
          changedAt: entry.changedAt,
        }))
        setAudit((prev) => ({ ...prev, [gradeId]: entries }))
      })()
    },
    [],
  )

  // ── Evaluation CRUD ──────────────────────────────────────────────────

  const onEvalChange = useCallback((updater: (prev: Evaluation[]) => Evaluation[]) => {
    setEvaluations(updater)
  }, [])

  const onCreateEvalApi = useCallback(
    async (data: { name: string; evaluationDate: string; weight: number }): Promise<Evaluation | null> => {
      const res = await createEvaluation({
        ...data,
        subjectId,
        period,
      })
      if (!res.ok) {
        flash('info', `Error creando evaluación: ${toMsg(res.error)}`)
        return null
      }
      return toEvaluation(res.value)
    },
    [subjectId, period, flash],
  )

  const onUpdateEvalApi = useCallback(
    async (id: string, data: { name: string; evaluationDate: string; weight: number }): Promise<Evaluation | null> => {
      const res = await updateEvaluation(id, data)
      if (!res.ok) {
        flash('info', `Error actualizando evaluación: ${toMsg(res.error)}`)
        return null
      }
      return toEvaluation(res.value)
    },
    [flash],
  )

  const onDeleteEvalApi = useCallback(
    async (id: string): Promise<boolean> => {
      const res = await deleteEvaluation(id)
      if (!res.ok) {
        const msg = 'status' in res.error && res.error.status === 409
          ? 'No se puede eliminar: la evaluación tiene notas registradas.'
          : `Error eliminando evaluación: ${toMsg(res.error)}`
        flash('info', msg)
        return false
      }
      return true
    },
    [flash],
  )

  // ── Grade mutations ──────────────────────────────────────────────────

  const onRegister = useCallback(
    (evaluationId: string, studentId: string, score: number) => {
      void (async () => {
        const res = await registerGrade(evaluationId, studentId, score)
        if (!res.ok) {
          flash('info', `Error al registrar la nota: ${toMsg(res.error)}`)
          return
        }
        const grade = toGrade(res.value)
        setGrades((prev) => [...prev, grade])
        const ts = new Date().toISOString()
        const auditEntry: GradeAuditEntry = {
          id: 'a' + Date.now(),
          oldValue: null,
          newValue: score,
          changedBy: currentUserId ?? '',
          changedAt: ts,
        }
        setAudit((prev) => ({ ...prev, [grade.id]: [auditEntry] }))
        flash('success', 'Nota registrada.')
      })()
    },
    [flash, currentUserId],
  )

  const onCorrect = useCallback(
    (gradeId: string, score: number) => {
      void (async () => {
        const res = await correctGrade(gradeId, score)
        if (!res.ok) {
          flash('info', `Error al corregir la nota: ${toMsg(res.error)}`)
          return
        }
        const updated = toGrade(res.value)
        setGrades((prev) => prev.map((g) => (g.id === gradeId ? updated : g)))
        const ts = new Date().toISOString()
        setAudit((prev) => {
          const history = prev[gradeId] ?? []
          const oldValue = history.length ? history[history.length - 1].newValue : null
          const entry: GradeAuditEntry = {
            id: 'a' + Date.now(),
            oldValue,
            newValue: score,
            changedBy: currentUserId ?? '',
            changedAt: ts,
          }
          return { ...prev, [gradeId]: [...history, entry] }
        })
        flash('success', 'Nota corregida — registrada en la auditoría.')
      })()
    },
    [flash, currentUserId],
  )

  // Keep users map in sync with current user
  useEffect(() => {
    if (currentUserId && user?.displayName) {
      setUsers((prev) => ({ ...prev, [currentUserId]: user.displayName! }))
    }
  }, [currentUserId, user?.displayName])

  return {
    subjects,
    students,
    periods,
    perms: ALL_ENABLED,
    users,
    evaluations,
    grades,
    audit,
    subjectId,
    period,
    setSubjectId,
    setPeriod,
    loading,
    evalLoading,
    error,
    toast,
    flash,
    onEvalChange,
    onRegister,
    onCorrect,
    loadAudit,
    onCreateEvalApi,
    onUpdateEvalApi,
    onDeleteEvalApi,
  }
}
