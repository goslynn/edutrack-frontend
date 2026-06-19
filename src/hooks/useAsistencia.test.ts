import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useAsistencia } from './useAsistencia'
import { ok, err } from '@/api/result'
import {
  closeSession,
  createRecord,
  getAsistenciaBundle,
  openSession,
} from '@/api/asistencia'

vi.mock('@/api/asistencia', () => ({
  getAsistenciaBundle: vi.fn(),
  openSession: vi.fn(),
  closeSession: vi.fn(),
  createRecord: vi.fn(),
}))

const bundleMock = vi.mocked(getAsistenciaBundle)
const openMock = vi.mocked(openSession)
const closeMock = vi.mocked(closeSession)
const recordMock = vi.mocked(createRecord)

const bundle = {
  course: { id: 'c1', name: '1°A', description: 'Matemática' },
  students: [
    { id: 's2', rut: '2-7', firstName: 'Beto', lastName: 'Zamora', courseId: 'c1' },
    { id: 's1', rut: '1-9', firstName: 'Ana', lastName: 'Acosta', courseId: 'c1' },
  ],
  sessions: [] as [],
}

beforeEach(() => {
  vi.clearAllMocks()
  bundleMock.mockResolvedValue(ok(bundle))
})

describe('useAsistencia carga', () => {
  it('arma la nómina ordenada por apellido y mapea el curso', async () => {
    const { result } = renderHook(() => useAsistencia('c1'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBeNull()
    expect(result.current.data.course).toMatchObject({ id: 'c1', name: '1°A', subject: 'Matemática', students: 2 })
    expect(result.current.data.students.map((s) => s.name)).toEqual(['Acosta, Ana', 'Zamora, Beto'])
    expect(result.current.data.students[0].n).toBe(1)
  })

  it('propaga el error del bundle', async () => {
    bundleMock.mockResolvedValue(err({ kind: 'network', error: null }))
    const { result } = renderHook(() => useAsistencia('c1'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toMatch(/conectar/)
  })

  it('reload vuelve a pedir el bundle', async () => {
    const { result } = renderHook(() => useAsistencia('c1'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    await act(async () => { await result.current.reload() })
    expect(bundleMock).toHaveBeenCalledTimes(2)
  })
})

describe('openSession', () => {
  it('devuelve el sessionId', async () => {
    openMock.mockResolvedValue(ok({ data: { id: 'sess-1' } as never }))
    const { result } = renderHook(() => useAsistencia('c1'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    let id = ''
    await act(async () => { id = await result.current.openSession() })
    expect(id).toBe('sess-1')
    expect(openMock).toHaveBeenCalledWith('c1', 'c1')
  })

  it('lanza con el mensaje de error', async () => {
    openMock.mockResolvedValue(err({ kind: 'network', error: null }))
    const { result } = renderHook(() => useAsistencia('c1'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    await expect(result.current.openSession()).rejects.toThrow(/conectar/)
  })
})

describe('closeSession', () => {
  it('envía un registro por alumno y cierra (null en éxito)', async () => {
    recordMock.mockResolvedValue(ok({ data: {} }))
    closeMock.mockResolvedValue(ok({ data: { id: 'sess-1' } as never }))
    const { result } = renderHook(() => useAsistencia('c1'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    let out: string | null = 'x'
    await act(async () => { out = await result.current.closeSession('sess-1', { 1: 'ausente', 2: 'atrasado' }) })
    expect(out).toBeNull()
    expect(recordMock).toHaveBeenCalledTimes(2)
    // "atrasado" se mapea a PRESENT
    const statuses = recordMock.mock.calls.map((c) => c[3])
    expect(statuses).toContain('ABSENT')
    expect(statuses).toContain('PRESENT')
    expect(closeMock).toHaveBeenCalledWith('c1', 'sess-1')
  })

  it('si un registro falla devuelve el mensaje y no cierra', async () => {
    recordMock.mockResolvedValue(err({ kind: 'network', error: null }))
    const { result } = renderHook(() => useAsistencia('c1'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    let out: string | null = null
    await act(async () => { out = await result.current.closeSession('sess-1', {}) })
    expect(out).toMatch(/conectar/)
    expect(closeMock).not.toHaveBeenCalled()
  })

  it('si el cierre falla devuelve el mensaje', async () => {
    recordMock.mockResolvedValue(ok({ data: {} }))
    closeMock.mockResolvedValue(err({ kind: 'timeout', timeoutMs: 1 }))
    const { result } = renderHook(() => useAsistencia('c1'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    let out: string | null = null
    await act(async () => { out = await result.current.closeSession('sess-1', {}) })
    expect(out).toMatch(/tardó demasiado/)
  })
})
