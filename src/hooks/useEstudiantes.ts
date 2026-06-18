// ── Hook de feature: Estudiantes y Cursos ────────────────────────────
// Orquesta la carga y mutaciones de alumnos + cursos vía el BFF.
// Carga inicial desde el composite GET (un round-trip); tras cada mutación
// exitosa recarga para que el shape sea exactamente el del backend.

import { useCallback, useEffect, useState } from 'react'

import {
  getEstudiantesBundle,
  createStudent as createStudentApi,
  updateStudent as updateStudentApi,
  deleteStudent as deleteStudentApi,
  transferStudent as transferStudentApi,
  createGuardian as createGuardianApi,
  createCourse as createCourseApi,
  updateCourse as updateCourseApi,
  deleteCourse as deleteCourseApi,
} from '@/api/estudiantes'
import { failureToError } from '@/api/errors'
import type { HttpFailure } from '@/api/http-client'
import type { ErrorResponse } from '@/api/errors'
import type { Course, PermMap, Student } from '@/types/estudiantes'
import type { StudentForm } from '@/components/estudiantes/student-dialog'
import type { CourseForm } from '@/components/estudiantes/course-dialog'

const toMsg = (failure: HttpFailure<ErrorResponse>): string =>
  failureToError(failure).message

interface UseEstudiantesState {
  students: Student[]
  courses: Course[]
  loading: boolean
  error: string | null
}

export interface UseEstudiantesReturn extends UseEstudiantesState {
  perms: PermMap
  createStudent: (data: StudentForm) => Promise<string | null>
  updateStudent: (id: string, data: StudentForm) => Promise<string | null>
  deleteStudent: (student: Student) => Promise<string | null>
  transferStudent: (studentId: string, destCourseId: string) => Promise<string | null>
  createCourse: (data: CourseForm) => Promise<string | null>
  updateCourse: (id: string, data: CourseForm) => Promise<string | null>
  deleteCourse: (course: Course) => Promise<string | null>
  reload: () => Promise<void>
}

// Todos los permisos habilitados: RBAC por rol se implementa en una fase posterior.
const ALL_ENABLED: PermMap = {
  'students.create': 'enabled',
  'students.edit': 'enabled',
  'students.transfer': 'enabled',
  'students.delete': 'enabled',
  'courses.create': 'enabled',
  'courses.edit': 'enabled',
  'courses.delete': 'enabled',
}

export function useEstudiantes(): UseEstudiantesReturn {
  const [state, setState] = useState<UseEstudiantesState>({
    students: [],
    courses: [],
    loading: true,
    error: null,
  })

  const reload = useCallback(async () => {
    const res = await getEstudiantesBundle()
    setState((prev) => {
      if (!res.ok) return { ...prev, loading: false, error: toMsg(res.error) }
      return { students: res.value.students, courses: res.value.courses, loading: false, error: null }
    })
  }, [])

  useEffect(() => {
    let active = true
    void (async () => {
      const res = await getEstudiantesBundle()
      if (active)
        setState((prev) => {
          if (!res.ok) return { ...prev, loading: false, error: toMsg(res.error) }
          return { students: res.value.students, courses: res.value.courses, loading: false, error: null }
        })
    })()
    return () => {
      active = false
    }
  }, [])

  // ── Mutaciones de alumnos ───────────────────────────────────────────

  const createStudent = useCallback(
    async (data: StudentForm): Promise<string | null> => {
      const created = await createStudentApi({
        rut: data.rut,
        firstName: data.firstName,
        lastName: data.lastName,
        birthDate: data.birthDate,
        courseId: data.courseId,
      })
      if (!created.ok) return toMsg(created.error)

      // Registra los apoderados asociados al alumno recién creado.
      for (const g of data.guardians) {
        const res = await createGuardianApi(created.value.id, {
          firstName: g.firstName,
          lastName: g.lastName,
          email: g.email,
          phone: g.phone ?? '',
          relationType: g.relationType,
        })
        if (!res.ok) {
          await reload()
          return toMsg(res.error)
        }
      }

      await reload()
      return null
    },
    [reload],
  )

  const updateStudent = useCallback(
    async (id: string, data: StudentForm): Promise<string | null> => {
      // PUT solo actualiza datos personales; el curso se cambia únicamente por traslado.
      const res = await updateStudentApi(id, {
        firstName: data.firstName,
        lastName: data.lastName,
        birthDate: data.birthDate,
      })
      if (!res.ok) return toMsg(res.error)
      await reload()
      return null
    },
    [reload],
  )

  const deleteStudent = useCallback(
    async (student: Student): Promise<string | null> => {
      const res = await deleteStudentApi(student.id)
      if (!res.ok) return toMsg(res.error)
      await reload()
      return null
    },
    [reload],
  )

  const transferStudent = useCallback(
    async (studentId: string, destCourseId: string): Promise<string | null> => {
      const res = await transferStudentApi(studentId, { courseId: destCourseId })
      if (!res.ok) return toMsg(res.error)
      await reload()
      return null
    },
    [reload],
  )

  // ── Mutaciones de cursos ────────────────────────────────────────────

  const createCourse = useCallback(
    async (data: CourseForm): Promise<string | null> => {
      const res = await createCourseApi({
        name: data.name,
        description: data.description,
        level: data.level,
        section: data.section,
        academicYear: data.academicYear,
      })
      if (!res.ok) return toMsg(res.error)
      await reload()
      return null
    },
    [reload],
  )

  const updateCourse = useCallback(
    async (id: string, data: CourseForm): Promise<string | null> => {
      const res = await updateCourseApi(id, {
        name: data.name,
        description: data.description,
        level: data.level,
        section: data.section,
        academicYear: data.academicYear,
      })
      if (!res.ok) return toMsg(res.error)
      await reload()
      return null
    },
    [reload],
  )

  const deleteCourse = useCallback(
    async (course: Course): Promise<string | null> => {
      const res = await deleteCourseApi(course.id)
      if (!res.ok) return toMsg(res.error)
      await reload()
      return null
    },
    [reload],
  )

  return {
    ...state,
    perms: ALL_ENABLED,
    reload,
    createStudent,
    updateStudent,
    deleteStudent,
    transferStudent,
    createCourse,
    updateCourse,
    deleteCourse,
  }
}
