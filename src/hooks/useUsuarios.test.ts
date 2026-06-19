import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useUsuarios } from './useUsuarios'
import { ok, err } from '@/api/result'
import {
  assignRole,
  createUser,
  disableUser,
  listRoles,
  listUsers,
  revokeRole,
  updateUser,
} from '@/api/configuracion'
import type { AuthRole, AuthUser } from '@/types/usuarios'

vi.mock('@/api/configuracion', () => ({
  listUsers: vi.fn(),
  listRoles: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  disableUser: vi.fn(),
  assignRole: vi.fn(),
  revokeRole: vi.fn(),
}))

const listUsersMock = vi.mocked(listUsers)
const listRolesMock = vi.mocked(listRoles)
const createUserMock = vi.mocked(createUser)
const updateUserMock = vi.mocked(updateUser)
const disableUserMock = vi.mocked(disableUser)
const assignRoleMock = vi.mocked(assignRole)
const revokeRoleMock = vi.mocked(revokeRole)

const roles: AuthRole[] = [{ id: 'r1', name: 'Docente' }, { id: 'r2', name: 'Admin' }]
const user: AuthUser = { id: 'u1', email: 'a@b.cl', displayName: 'Ana', enabled: true, roleIds: ['r1'] }

beforeEach(() => {
  vi.clearAllMocks()
  listUsersMock.mockResolvedValue(ok([user]))
  listRolesMock.mockResolvedValue(ok(roles))
})

async function mounted() {
  const hook = renderHook(() => useUsuarios())
  await waitFor(() => expect(hook.result.current.loading).toBe(false))
  return hook
}

describe('useUsuarios carga', () => {
  it('carga usuarios y roles', async () => {
    const { result } = await mounted()
    expect(result.current.users).toHaveLength(1)
    expect(result.current.roles).toHaveLength(2)
    expect(result.current.error).toBeNull()
  })

  it('error al listar usuarios', async () => {
    listUsersMock.mockResolvedValue(err({ kind: 'network', error: null }))
    const { result } = await mounted()
    expect(result.current.error).toMatch(/conectar/)
  })

  it('error al listar roles', async () => {
    listRolesMock.mockResolvedValue(err({ kind: 'timeout', timeoutMs: 1 }))
    const { result } = await mounted()
    expect(result.current.error).toMatch(/tardó demasiado/)
  })
})

describe('create', () => {
  it('crea el usuario y asigna sus roles', async () => {
    createUserMock.mockResolvedValue(ok({ ...user, id: 'u9' }))
    assignRoleMock.mockResolvedValue(ok(undefined))
    const { result } = await mounted()
    let out: string | null = 'x'
    await act(async () => {
      out = await result.current.create({ email: 'n@b.cl', password: 'p', displayName: 'Nuevo', roleIds: ['r1', 'r2'] })
    })
    expect(out).toBeNull()
    expect(assignRoleMock).toHaveBeenCalledTimes(2)
  })

  it('error al crear corta', async () => {
    createUserMock.mockResolvedValue(err({ kind: 'network', error: null }))
    const { result } = await mounted()
    let out: string | null = null
    await act(async () => {
      out = await result.current.create({ email: 'n@b.cl', password: 'p', displayName: 'Nuevo', roleIds: ['r1'] })
    })
    expect(out).toMatch(/conectar/)
    expect(assignRoleMock).not.toHaveBeenCalled()
  })

  it('error al asignar un rol recarga y devuelve mensaje', async () => {
    createUserMock.mockResolvedValue(ok({ ...user, id: 'u9' }))
    assignRoleMock.mockResolvedValue(err({ kind: 'network', error: null }))
    const { result } = await mounted()
    let out: string | null = null
    await act(async () => {
      out = await result.current.create({ email: 'n@b.cl', password: 'p', displayName: 'Nuevo', roleIds: ['r1'] })
    })
    expect(out).toMatch(/conectar/)
  })
})

describe('update', () => {
  it('actualiza datos y reconcilia roles (asigna r2, revoca r1)', async () => {
    updateUserMock.mockResolvedValue(ok(user))
    assignRoleMock.mockResolvedValue(ok(undefined))
    revokeRoleMock.mockResolvedValue(ok(undefined))
    const { result } = await mounted()
    let out: string | null = 'x'
    await act(async () => {
      out = await result.current.update('u1', { displayName: 'Ana 2' }, ['r2'])
    })
    expect(out).toBeNull()
    expect(assignRoleMock).toHaveBeenCalledWith('u1', 'r2')
    expect(revokeRoleMock).toHaveBeenCalledWith('u1', 'r1')
  })

  it('error al actualizar', async () => {
    updateUserMock.mockResolvedValue(err({ kind: 'network', error: null }))
    const { result } = await mounted()
    let out: string | null = null
    await act(async () => { out = await result.current.update('u1', { displayName: 'x' }, ['r1']) })
    expect(out).toMatch(/conectar/)
  })
})

describe('setEnabled', () => {
  it('habilita con updateUser', async () => {
    updateUserMock.mockResolvedValue(ok(user))
    const { result } = await mounted()
    await act(async () => { expect(await result.current.setEnabled('u1', true)).toBeNull() })
    expect(updateUserMock).toHaveBeenCalledWith('u1', { enabled: true })
  })

  it('inhabilita con disableUser', async () => {
    disableUserMock.mockResolvedValue(ok(undefined))
    const { result } = await mounted()
    await act(async () => { expect(await result.current.setEnabled('u1', false)).toBeNull() })
    expect(disableUserMock).toHaveBeenCalledWith('u1')
  })

  it('propaga error', async () => {
    disableUserMock.mockResolvedValue(err({ kind: 'network', error: null }))
    const { result } = await mounted()
    let out: string | null = null
    await act(async () => { out = await result.current.setEnabled('u1', false) })
    expect(out).toMatch(/conectar/)
  })
})
