import { describe, expect, it, vi, beforeEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useLogin } from './useLogin'
import { ok, err } from '@/api/result'
import { login } from '@/api/auth'

vi.mock('@/api/auth', () => ({ login: vi.fn() }))
const loginMock = vi.mocked(login)

beforeEach(() => vi.clearAllMocks())

describe('useLogin', () => {
  it('estado inicial', () => {
    const { result } = renderHook(() => useLogin())
    expect(result.current).toMatchObject({ data: null, loading: false, error: null })
  })

  it('login exitoso devuelve los tokens y los guarda en data', async () => {
    const tokens = { accessToken: 'a', refreshToken: 'r' }
    loginMock.mockResolvedValue(ok(tokens))

    const { result } = renderHook(() => useLogin())
    let returned: unknown
    await act(async () => {
      returned = await result.current.execute({ email: 'a@b.cl', password: 'p' })
    })

    expect(returned).toEqual(tokens)
    expect(result.current.data).toEqual(tokens)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('login fallido devuelve null y expone el error legible', async () => {
    loginMock.mockResolvedValue(err({ kind: 'network', error: null }))

    const { result } = renderHook(() => useLogin())
    let returned: unknown
    await act(async () => {
      returned = await result.current.execute({ email: 'a@b.cl', password: 'x' })
    })

    expect(returned).toBeNull()
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toMatch(/conectar/)
  })
})
