import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useRoles } from './useRoles'
import { ok, err } from '@/api/result'
import {
  createRole,
  deleteRolePermission,
  getResourceCatalog,
  listRolePermissions,
  listRoles,
  updateRole,
  upsertRolePermission,
} from '@/api/configuracion'
import type { AuthPermission, AuthRole, ResourceCatalogResponse } from '@/types/usuarios'

vi.mock('@/api/configuracion', () => ({
  listRoles: vi.fn(),
  getResourceCatalog: vi.fn(),
  listRolePermissions: vi.fn(),
  createRole: vi.fn(),
  updateRole: vi.fn(),
  upsertRolePermission: vi.fn(),
  deleteRolePermission: vi.fn(),
}))

const listRolesMock = vi.mocked(listRoles)
const catalogMock = vi.mocked(getResourceCatalog)
const listPermsMock = vi.mocked(listRolePermissions)
const createRoleMock = vi.mocked(createRole)
const updateRoleMock = vi.mocked(updateRole)
const upsertMock = vi.mocked(upsertRolePermission)
const deletePermMock = vi.mocked(deleteRolePermission)

const roles: AuthRole[] = [{ id: 'r1', name: 'Docente', description: 'profe' }]
const catalog: ResourceCatalogResponse = {
  auth: { data: ['auth.users', 'auth.roles'], meta: { service: 'auth', count: 2 } },
  course: { data: ['course.courses'], meta: { service: 'course', count: 1 } },
}
const perms: AuthPermission[] = [{ roleId: 'r1', resourceKey: 'auth.users', flags: 6, flagsLabel: 'rw-' }]

beforeEach(() => {
  vi.clearAllMocks()
  listRolesMock.mockResolvedValue(ok(roles))
  catalogMock.mockResolvedValue(ok(catalog))
  listPermsMock.mockResolvedValue(ok(perms))
})

async function mounted() {
  const hook = renderHook(() => useRoles())
  await waitFor(() => expect(hook.result.current.loading).toBe(false))
  return hook
}

describe('useRoles carga', () => {
  it('arma roles, permServices y rolePermissions', async () => {
    const { result } = await mounted()
    expect(result.current.roles).toEqual([{ id: 'r1', name: 'Docente', desc: 'profe', system: false, users: 0 }])
    expect(result.current.rolePermissions).toEqual({ r1: { 'auth.users': 6 } })
    // SERVICE_META mapea auth→label conocido; course también
    const labels = result.current.permServices.map((s) => s.label)
    expect(labels).toContain('Usuarios y acceso')
    expect(labels).toContain('Cursos')
  })

  it('error al listar roles', async () => {
    listRolesMock.mockResolvedValue(err({ kind: 'network', error: null }))
    const { result } = await mounted()
    expect(result.current.error).toMatch(/conectar/)
  })

  it('error al pedir el catálogo', async () => {
    catalogMock.mockResolvedValue(err({ kind: 'timeout', timeoutMs: 1 }))
    const { result } = await mounted()
    expect(result.current.error).toMatch(/tardó demasiado/)
  })

  it('si fallan los permisos de un rol, se trata como sin permisos', async () => {
    listPermsMock.mockResolvedValue(err({ kind: 'network', error: null }))
    const { result } = await mounted()
    expect(result.current.rolePermissions.r1).toBeUndefined()
  })
})

describe('createRoleWithPerms', () => {
  it('crea el rol y aplica solo los flags > 0', async () => {
    createRoleMock.mockResolvedValue(ok({ id: 'r9', name: 'Nuevo' }))
    upsertMock.mockResolvedValue(ok({} as never))
    const { result } = await mounted()
    let out: string | null = 'x'
    await act(async () => {
      out = await result.current.createRoleWithPerms('Nuevo', 'desc', { 'auth.users': 4, 'auth.roles': 0 })
    })
    expect(out).toBeNull()
    expect(upsertMock).toHaveBeenCalledTimes(1)
    expect(upsertMock).toHaveBeenCalledWith('r9', 'auth.users', 4)
  })

  it('error al crear el rol', async () => {
    createRoleMock.mockResolvedValue(err({ kind: 'network', error: null }))
    const { result } = await mounted()
    let out: string | null = null
    await act(async () => { out = await result.current.createRoleWithPerms('X', '', {}) })
    expect(out).toMatch(/conectar/)
  })
})

describe('updateRoleWithPerms', () => {
  it('upsert los activos y elimina los que pasaron a 0', async () => {
    updateRoleMock.mockResolvedValue(ok(roles[0]))
    upsertMock.mockResolvedValue(ok({} as never))
    deletePermMock.mockResolvedValue(ok(undefined))
    const { result } = await mounted()
    // prev: r1 tiene auth.users=6. Lo dejamos en 0 (debe borrarse) y agregamos auth.roles=2.
    let out: string | null = 'x'
    await act(async () => {
      out = await result.current.updateRoleWithPerms('r1', 'Docente', { 'auth.users': 0, 'auth.roles': 2 })
    })
    expect(out).toBeNull()
    expect(upsertMock).toHaveBeenCalledWith('r1', 'auth.roles', 2)
    expect(deletePermMock).toHaveBeenCalledWith('r1', 'auth.users')
  })

  it('error al actualizar el nombre', async () => {
    updateRoleMock.mockResolvedValue(err({ kind: 'network', error: null }))
    const { result } = await mounted()
    let out: string | null = null
    await act(async () => { out = await result.current.updateRoleWithPerms('r1', 'X', {}) })
    expect(out).toMatch(/conectar/)
  })
})
