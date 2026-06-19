import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext'
import { ok, err } from '@/api/result'
import { isAuthenticated, getCurrentUserId } from '@/lib/session'
import { getUserById } from '@/api/auth'
import type { AuthUser } from '@/types/usuarios'

vi.mock('@/lib/session', () => ({
  isAuthenticated: vi.fn(),
  getCurrentUserId: vi.fn(),
}))
vi.mock('@/api/auth', () => ({
  getUserById: vi.fn(),
}))

const isAuthMock = vi.mocked(isAuthenticated)
const currentIdMock = vi.mocked(getCurrentUserId)
const getUserMock = vi.mocked(getUserById)

const user: AuthUser = { id: 'u1', email: 'a@b.cl', displayName: 'Ana Prof', enabled: true, roleIds: [] }

function Consumer() {
  const { user, isLoading } = useAuth()
  return <div data-testid="out">{isLoading ? 'loading' : (user?.displayName ?? 'anon')}</div>
}

function renderApp() {
  return render(
    <AuthProvider>
      <Consumer />
    </AuthProvider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})
afterEach(() => {
  vi.restoreAllMocks()
})

describe('AuthProvider', () => {
  it('sin sesión: no carga perfil, isLoading false y user null', async () => {
    isAuthMock.mockReturnValue(false)
    renderApp()
    await waitFor(() => expect(screen.getByTestId('out').textContent).toBe('anon'))
    expect(getUserMock).not.toHaveBeenCalled()
  })

  it('con sesión y perfil: carga el usuario', async () => {
    isAuthMock.mockReturnValue(true)
    currentIdMock.mockReturnValue('u1')
    getUserMock.mockResolvedValue(ok(user))
    renderApp()
    await waitFor(() => expect(screen.getByTestId('out').textContent).toBe('Ana Prof'))
  })

  it('con sesión pero sin id legible: no carga perfil', async () => {
    isAuthMock.mockReturnValue(true)
    currentIdMock.mockReturnValue(null)
    renderApp()
    await waitFor(() => expect(screen.getByTestId('out').textContent).toBe('anon'))
    expect(getUserMock).not.toHaveBeenCalled()
  })

  it('si getUserById falla, deja de cargar sin user', async () => {
    isAuthMock.mockReturnValue(true)
    currentIdMock.mockReturnValue('u1')
    getUserMock.mockResolvedValue(err({ kind: 'network', error: null }))
    renderApp()
    await waitFor(() => expect(screen.getByTestId('out').textContent).toBe('anon'))
  })
})

describe('useAuth', () => {
  it('lanza fuera del provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Consumer />)).toThrow(/AuthProvider/)
    spy.mockRestore()
  })
})
