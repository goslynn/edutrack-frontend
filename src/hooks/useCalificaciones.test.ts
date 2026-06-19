import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useCalificaciones } from './useCalificaciones'
import { ok, err } from '@/api/result'
import {
  correctGrade,
  createEvaluation,
  deleteEvaluation,
  getCalificacionesBundle,
  getEvalBundle,
  getGradeHistory,
  registerGrade,
  updateEvaluation,
} from '@/api/calificaciones'

vi.mock('@/api/calificaciones', () => ({
  getCalificacionesBundle: vi.fn(),
  getEvalBundle: vi.fn(),
  createEvaluation: vi.fn(),
  updateEvaluation: vi.fn(),
  deleteEvaluation: vi.fn(),
  registerGrade: vi.fn(),
  correctGrade: vi.fn(),
  getGradeHistory: vi.fn(),
}))
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: { displayName: 'Prof Ana' }, isLoading: false, setUser: vi.fn() }),
}))
vi.mock('@/lib/session', () => ({ getCurrentUserId: () => 'u1' }))

const bundleMock = vi.mocked(getCalificacionesBundle)
const evalBundleMock = vi.mocked(getEvalBundle)
const createEvalMock = vi.mocked(createEvaluation)
const updateEvalMock = vi.mocked(updateEvaluation)
const deleteEvalMock = vi.mocked(deleteEvaluation)
const registerMock = vi.mocked(registerGrade)
const correctMock = vi.mocked(correctGrade)
const historyMock = vi.mocked(getGradeHistory)

const bundle = {
  subjects: [{ id: 'sub1', name: 'Matemática', course: '1°A', teacher: 'Prof Ana' }],
  students: [
    { id: 'st2', firstName: 'Beto', lastName: 'Zamora', rut: '2-7' },
    { id: 'st1', firstName: 'Ana', lastName: 'Acosta', rut: '1-9' },
  ],
}

const evalBundle = {
  courseId: 'c1',
  subjectId: 'sub1',
  period: '2026-1',
  evaluations: [{ id: 'e1', name: 'P1', evaluationDate: '2026-03-01', weight: 30, subjectId: 'sub1', period: '2026-1' }],
  grades: [{ id: 'g1', evaluationId: 'e1', studentId: 'st1', score: 5 }],
}

beforeEach(() => {
  vi.clearAllMocks()
  bundleMock.mockResolvedValue(ok(bundle))
  evalBundleMock.mockResolvedValue(ok(evalBundle))
})

async function mounted() {
  const hook = renderHook(() => useCalificaciones('c1'))
  await waitFor(() => expect(hook.result.current.loading).toBe(false))
  await waitFor(() => expect(hook.result.current.evalLoading).toBe(false))
  return hook
}

describe('useCalificaciones carga', () => {
  it('mapea subjects/students y autoselecciona la primera asignatura', async () => {
    const { result } = await mounted()
    expect(result.current.subjects).toHaveLength(1)
    expect(result.current.students.map((s) => s.lastName)).toEqual(['Acosta', 'Zamora'])
    expect(result.current.subjectId).toBe('sub1')
    expect(result.current.perms['grades.write']).toBe('enabled')
  })

  it('carga evaluaciones, notas y deriva periodos', async () => {
    const { result } = await mounted()
    expect(result.current.evaluations).toHaveLength(1)
    expect(result.current.grades).toHaveLength(1)
    expect(result.current.periods).toEqual(expect.arrayContaining(['2026-1', '2026-2']))
  })

  it('error de bundle', async () => {
    bundleMock.mockResolvedValue(err({ kind: 'network', error: null }))
    const { result } = renderHook(() => useCalificaciones('c1'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toMatch(/conectar/)
  })

  it('eval bundle 404 → listas vacías', async () => {
    evalBundleMock.mockResolvedValue(err({ kind: 'http', status: 404, statusText: 'NF', body: null, response: {} as Response }))
    const { result } = await mounted()
    expect(result.current.evaluations).toEqual([])
    expect(result.current.grades).toEqual([])
  })

  it('eval bundle error distinto de 404 → toast info', async () => {
    evalBundleMock.mockResolvedValue(err({ kind: 'network', error: null }))
    const { result } = await mounted()
    await waitFor(() => expect(result.current.toast?.variant).toBe('info'))
  })
})

describe('Evaluation CRUD', () => {
  it('onCreateEvalApi devuelve la evaluación mapeada', async () => {
    createEvalMock.mockResolvedValue(ok({ id: 'e2', name: 'P2', evaluationDate: '2026-04-01', weight: 70, subjectId: 'sub1', period: '2026-1' }))
    const { result } = await mounted()
    let created: unknown
    await act(async () => { created = await result.current.onCreateEvalApi({ name: 'P2', evaluationDate: '2026-04-01', weight: 70 }) })
    expect(created).toMatchObject({ id: 'e2', name: 'P2' })
  })

  it('onCreateEvalApi error → null + toast', async () => {
    createEvalMock.mockResolvedValue(err({ kind: 'network', error: null }))
    const { result } = await mounted()
    let created: unknown = 'x'
    await act(async () => { created = await result.current.onCreateEvalApi({ name: 'P2', evaluationDate: '2026-04-01', weight: 70 }) })
    expect(created).toBeNull()
    expect(result.current.toast?.variant).toBe('info')
  })

  it('onUpdateEvalApi success y error', async () => {
    updateEvalMock.mockResolvedValueOnce(ok({ id: 'e1', name: 'P1b', evaluationDate: '2026-03-01', weight: 30, subjectId: 'sub1', period: '2026-1' }))
    const { result } = await mounted()
    await act(async () => { expect(await result.current.onUpdateEvalApi('e1', { name: 'P1b', evaluationDate: '2026-03-01', weight: 30 })).toMatchObject({ name: 'P1b' }) })

    updateEvalMock.mockResolvedValueOnce(err({ kind: 'network', error: null }))
    await act(async () => { expect(await result.current.onUpdateEvalApi('e1', { name: 'x', evaluationDate: '2026-03-01', weight: 30 })).toBeNull() })
  })

  it('onDeleteEvalApi: éxito, 409 y error genérico', async () => {
    const { result } = await mounted()

    deleteEvalMock.mockResolvedValueOnce(ok(undefined))
    await act(async () => { expect(await result.current.onDeleteEvalApi('e1')).toBe(true) })

    deleteEvalMock.mockResolvedValueOnce(err({ kind: 'http', status: 409, statusText: 'C', body: null, response: {} as Response }))
    await act(async () => { expect(await result.current.onDeleteEvalApi('e1')).toBe(false) })
    expect(result.current.toast?.msg).toMatch(/notas registradas/)

    deleteEvalMock.mockResolvedValueOnce(err({ kind: 'network', error: null }))
    await act(async () => { expect(await result.current.onDeleteEvalApi('e1')).toBe(false) })
  })
})

describe('Grade mutations', () => {
  it('onRegister agrega la nota, registra auditoría y notifica', async () => {
    registerMock.mockResolvedValue(ok({ id: 'g2', evaluationId: 'e1', studentId: 'st2', score: 6 }))
    const { result } = await mounted()
    await act(async () => { result.current.onRegister('e1', 'st2', 6) })
    await waitFor(() => expect(result.current.grades.some((g) => g.id === 'g2')).toBe(true))
    expect(result.current.audit.g2).toHaveLength(1)
    expect(result.current.toast?.variant).toBe('success')
  })

  it('onRegister error → toast info', async () => {
    registerMock.mockResolvedValue(err({ kind: 'network', error: null }))
    const { result } = await mounted()
    await act(async () => { result.current.onRegister('e1', 'st2', 6) })
    await waitFor(() => expect(result.current.toast?.variant).toBe('info'))
  })

  it('onCorrect reemplaza la nota y agrega entrada de auditoría', async () => {
    correctMock.mockResolvedValue(ok({ id: 'g1', evaluationId: 'e1', studentId: 'st1', score: 6.5 }))
    const { result } = await mounted()
    await act(async () => { result.current.onCorrect('g1', 6.5) })
    await waitFor(() => expect(result.current.grades.find((g) => g.id === 'g1')?.score).toBe(6.5))
    expect(result.current.audit.g1?.length).toBeGreaterThanOrEqual(1)
  })

  it('loadAudit carga el historial', async () => {
    historyMock.mockResolvedValue(ok([
      { id: 'al1', gradeId: 'g1', studentId: 'st1', evaluationId: 'e1', oldValue: null, newValue: 5, changedBy: 'u1', changedAt: '2026-03-02T10:00:00Z' },
    ]))
    const { result } = await mounted()
    await act(async () => { result.current.loadAudit('g1') })
    await waitFor(() => expect(result.current.audit.g1).toHaveLength(1))
  })
})

describe('selección', () => {
  it('setSubjectId y setPeriod actualizan estado', async () => {
    const { result } = await mounted()
    await act(async () => { result.current.setPeriod('2026-2') })
    expect(result.current.period).toBe('2026-2')
    await act(async () => { result.current.setSubjectId('sub1') })
    expect(result.current.subjectId).toBe('sub1')
  })
})
