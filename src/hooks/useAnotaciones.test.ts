import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useAnotaciones } from './useAnotaciones'
import { ok, err } from '@/api/result'
import {
  createAnnotation,
  deleteAnnotation,
  getAnotacionesBundle,
} from '@/api/anotaciones'

vi.mock('@/api/anotaciones', () => ({
  getAnotacionesBundle: vi.fn(),
  createAnnotation: vi.fn(),
  deleteAnnotation: vi.fn(),
}))
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: { displayName: 'Prof Ana' }, isLoading: false, setUser: vi.fn() }),
}))
vi.mock('@/lib/session', () => ({
  getCurrentUserId: () => 'teacher-1',
}))

const bundleMock = vi.mocked(getAnotacionesBundle)
const createMock = vi.mocked(createAnnotation)
const deleteMock = vi.mocked(deleteAnnotation)

const bundle = {
  roster: [
    { id: 's2', firstName: 'Beto', lastName: 'Zamora', rut: '2-7' },
    { id: 's1', firstName: 'Ana', lastName: 'Acosta', rut: '1-9' },
  ],
  annotations: [
    { id: 'a1', studentId: 's1', teacherId: 'teacher-1', type: 'NEGATIVE' as const, content: 'atraso', date: '2026-06-10' },
    { id: 'a2', studentId: 's2', teacherId: 'otro', type: 'POSITIVE' as const, content: 'destaca', date: '2026-06-11' },
  ],
}

beforeEach(() => {
  vi.clearAllMocks()
  bundleMock.mockResolvedValue(ok(bundle))
})

describe('useAnotaciones carga', () => {
  it('ordena el roster y construye las anotaciones (autor + notificación)', async () => {
    const { result } = renderHook(() => useAnotaciones('c1'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.roster.map((r) => r.name)).toEqual(['Acosta, Ana', 'Zamora, Beto'])
    const a1 = result.current.annotations.find((a) => a.id === 'a1')!
    expect(a1.student).toBe('Acosta, Ana')
    expect(a1.author).toBe('Prof Ana') // teacherId === current user
    expect(a1.guardianNotified).toBe(true) // NEGATIVE
    const a2 = result.current.annotations.find((a) => a.id === 'a2')!
    expect(a2.author).toBe('Docente') // otro teacher
    expect(a2.guardianNotified).toBe(false)
    expect(result.current.currentTeacher).toEqual({ id: 'teacher-1', name: 'Prof Ana' })
  })

  it('propaga error de carga', async () => {
    bundleMock.mockResolvedValue(err({ kind: 'network', error: null }))
    const { result } = renderHook(() => useAnotaciones('c1'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toMatch(/conectar/)
  })
})

describe('createAnnotation', () => {
  it('prepende la anotación creada', async () => {
    createMock.mockResolvedValue(ok({ id: 'a3', studentId: 's1', teacherId: 'teacher-1', type: 'POSITIVE', content: 'nuevo', date: '2026-06-18' }))
    const { result } = renderHook(() => useAnotaciones('c1'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => { await result.current.createAnnotation('s1', 'POSITIVE', 'nuevo', '2026-06-18') })
    expect(result.current.annotations[0].id).toBe('a3')
    expect(result.current.annotations).toHaveLength(3)
  })

  it('lanza con el mensaje ante error', async () => {
    createMock.mockResolvedValue(err({ kind: 'network', error: null }))
    const { result } = renderHook(() => useAnotaciones('c1'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    await expect(result.current.createAnnotation('s1', 'POSITIVE', 'x', '2026-06-18')).rejects.toThrow(/conectar/)
  })
})

describe('deleteAnnotation', () => {
  it('elimina de la lista (null en éxito)', async () => {
    deleteMock.mockResolvedValue(ok(undefined))
    const { result } = renderHook(() => useAnotaciones('c1'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    let out: string | null = 'x'
    await act(async () => { out = await result.current.deleteAnnotation('a1') })
    expect(out).toBeNull()
    expect(result.current.annotations.find((a) => a.id === 'a1')).toBeUndefined()
  })

  it('devuelve mensaje ante error', async () => {
    deleteMock.mockResolvedValue(err({ kind: 'network', error: null }))
    const { result } = renderHook(() => useAnotaciones('c1'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    let out: string | null = null
    await act(async () => { out = await result.current.deleteAnnotation('a1') })
    expect(out).toMatch(/conectar/)
  })
})
