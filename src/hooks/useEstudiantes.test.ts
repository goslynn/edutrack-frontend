import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useEstudiantes } from './useEstudiantes'
import { ok, err } from '@/api/result'
import {
  createCourse,
  createGuardian,
  createStudent,
  deleteCourse,
  deleteStudent,
  getEstudiantesBundle,
  transferStudent,
  updateCourse,
  updateStudent,
} from '@/api/estudiantes'
import type { Course, Student } from '@/types/estudiantes'
import type { StudentForm } from '@/components/estudiantes/student-dialog'
import type { CourseForm } from '@/components/estudiantes/course-dialog'

vi.mock('@/api/estudiantes', () => ({
  getEstudiantesBundle: vi.fn(),
  createStudent: vi.fn(),
  updateStudent: vi.fn(),
  deleteStudent: vi.fn(),
  transferStudent: vi.fn(),
  createGuardian: vi.fn(),
  createCourse: vi.fn(),
  updateCourse: vi.fn(),
  deleteCourse: vi.fn(),
}))

const bundleMock = vi.mocked(getEstudiantesBundle)
const createStudentMock = vi.mocked(createStudent)
const createGuardianMock = vi.mocked(createGuardian)
const updateStudentMock = vi.mocked(updateStudent)
const deleteStudentMock = vi.mocked(deleteStudent)
const transferMock = vi.mocked(transferStudent)
const createCourseMock = vi.mocked(createCourse)
const updateCourseMock = vi.mocked(updateCourse)
const deleteCourseMock = vi.mocked(deleteCourse)

const aStudent: Student = { id: 's1', rut: '1-9', firstName: 'Ana', lastName: 'Acosta', birthDate: '2010-01-01', courseId: 'c1', status: 'ACTIVE', guardians: [] }
const aCourse: Course = { id: 'c1', name: '1°A', level: '1° Medio', section: 'A', academicYear: 2026, description: '', status: 'ACTIVE' }

const studentForm = {
  rut: '1-9', firstName: 'Ana', lastName: 'Acosta', birthDate: '2010-01-01', courseId: 'c1',
  guardians: [{ firstName: 'Mama', lastName: 'Acosta', email: 'm@a.cl', phone: '9', relationType: 'PARENT' }],
} as unknown as StudentForm

const courseForm = { name: '1°A', description: '', level: '1° Medio', section: 'A', academicYear: 2026 } as unknown as CourseForm

beforeEach(() => {
  vi.clearAllMocks()
  bundleMock.mockResolvedValue(ok({ students: [aStudent], courses: [aCourse] }))
})

async function mounted() {
  const hook = renderHook(() => useEstudiantes())
  await waitFor(() => expect(hook.result.current.loading).toBe(false))
  return hook
}

describe('useEstudiantes carga', () => {
  it('expone students, courses y perms all-enabled', async () => {
    const { result } = await mounted()
    expect(result.current.students).toHaveLength(1)
    expect(result.current.courses).toHaveLength(1)
    expect(result.current.perms['students.create']).toBe('enabled')
  })

  it('error de carga', async () => {
    bundleMock.mockResolvedValue(err({ kind: 'network', error: null }))
    const { result } = await mounted()
    expect(result.current.error).toMatch(/conectar/)
  })
})

describe('createStudent', () => {
  it('crea alumno + apoderados y recarga (null en éxito)', async () => {
    createStudentMock.mockResolvedValue(ok(aStudent))
    createGuardianMock.mockResolvedValue(ok({} as never))
    const { result } = await mounted()
    let out: string | null = 'x'
    await act(async () => { out = await result.current.createStudent(studentForm) })
    expect(out).toBeNull()
    expect(createGuardianMock).toHaveBeenCalledTimes(1)
    expect(bundleMock).toHaveBeenCalledTimes(2)
  })

  it('error al crear alumno corta sin crear apoderados', async () => {
    createStudentMock.mockResolvedValue(err({ kind: 'network', error: null }))
    const { result } = await mounted()
    let out: string | null = null
    await act(async () => { out = await result.current.createStudent(studentForm) })
    expect(out).toMatch(/conectar/)
    expect(createGuardianMock).not.toHaveBeenCalled()
  })

  it('error al crear apoderado recarga y devuelve mensaje', async () => {
    createStudentMock.mockResolvedValue(ok(aStudent))
    createGuardianMock.mockResolvedValue(err({ kind: 'timeout', timeoutMs: 1 }))
    const { result } = await mounted()
    let out: string | null = null
    await act(async () => { out = await result.current.createStudent(studentForm) })
    expect(out).toMatch(/tardó demasiado/)
  })
})

describe('mutaciones simples', () => {
  it('updateStudent / deleteStudent / transferStudent', async () => {
    updateStudentMock.mockResolvedValue(ok(aStudent))
    deleteStudentMock.mockResolvedValue(ok(undefined))
    transferMock.mockResolvedValue(ok(aStudent))
    const { result } = await mounted()

    await act(async () => { expect(await result.current.updateStudent('s1', studentForm)).toBeNull() })
    await act(async () => { expect(await result.current.deleteStudent(aStudent)).toBeNull() })
    await act(async () => { expect(await result.current.transferStudent('s1', 'c2')).toBeNull() })
    expect(transferMock).toHaveBeenCalledWith('s1', { courseId: 'c2' })
  })

  it('createCourse / updateCourse / deleteCourse', async () => {
    createCourseMock.mockResolvedValue(ok(aCourse))
    updateCourseMock.mockResolvedValue(ok(aCourse))
    deleteCourseMock.mockResolvedValue(ok(undefined))
    const { result } = await mounted()

    await act(async () => { expect(await result.current.createCourse(courseForm)).toBeNull() })
    await act(async () => { expect(await result.current.updateCourse('c1', courseForm)).toBeNull() })
    await act(async () => { expect(await result.current.deleteCourse(aCourse)).toBeNull() })
  })

  it('propaga error en una mutación', async () => {
    deleteStudentMock.mockResolvedValue(err({ kind: 'network', error: null }))
    const { result } = await mounted()
    let out: string | null = null
    await act(async () => { out = await result.current.deleteStudent(aStudent) })
    expect(out).toMatch(/conectar/)
  })
})
