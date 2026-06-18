import { useCallback, useEffect, useState } from 'react'

import {
  assignRole,
  createUser,
  disableUser,
  listRoles,
  listUsers,
  revokeRole,
  updateUser,
} from '@/api/configuracion'
import { failureToError } from '@/api/errors'
import type { HttpFailure } from '@/api/http-client'
import type { ErrorResponse } from '@/api/errors'
import type { AuthRole, AuthUser, CreateUserInput, UpdateUserInput } from '@/types/usuarios'

/** Mensaje legible (es-CL) de un fallo HTTP, para mostrar en el panel. */
const toMessage = (failure: HttpFailure<ErrorResponse>): string => failureToError(failure).message

interface UseUsuariosState {
  users: AuthUser[]
  roles: AuthRole[]
  loading: boolean
  error: string | null
}

/**
 * Reductor puro: combina el estado previo con el resultado de cargar usuarios +
 * roles. Ante error preserva los datos previos (recarga "silenciosa" tras una
 * mutación) y solo expone el mensaje. Vive fuera del componente para poder
 * reusarse entre el fetch de montaje y `reload` sin duplicar la lógica.
 */
function nextState(
  prev: UseUsuariosState,
  usersRes: Awaited<ReturnType<typeof listUsers>>,
  rolesRes: Awaited<ReturnType<typeof listRoles>>,
): UseUsuariosState {
  if (!usersRes.ok) return { ...prev, loading: false, error: toMessage(usersRes.error) }
  if (!rolesRes.ok) return { ...prev, loading: false, error: toMessage(rolesRes.error) }
  return { users: usersRes.value, roles: rolesRes.value, loading: false, error: null }
}

export interface UseUsuariosReturn extends UseUsuariosState {
  /** Crea el usuario y le asigna sus roles iniciales. Devuelve el error o `null`. */
  create: (input: CreateUserInput) => Promise<string | null>
  /** Actualiza datos del usuario y reconcilia sus roles. Devuelve el error o `null`. */
  update: (id: string, patch: UpdateUserInput, roleIds: string[]) => Promise<string | null>
  /** Habilita/inhabilita un usuario (PUT con `enabled`). Devuelve el error o `null`. */
  setEnabled: (id: string, enabled: boolean) => Promise<string | null>
  /** Recarga usuarios + roles desde el backend. */
  reload: () => Promise<void>
}

/**
 * Orquesta la gestión de usuarios: carga usuarios + catálogo de roles desde el
 * BFF, y expone handlers que componen las llamadas (crear + asignar roles,
 * actualizar + reconciliar roles, habilitar/inhabilitar). Tras cada mutación
 * exitosa recarga la lista para que el shape sea exactamente el del backend.
 */
export function useUsuarios(): UseUsuariosReturn {
  const [state, setState] = useState<UseUsuariosState>({
    users: [],
    roles: [],
    loading: true,
    error: null,
  })

  const reload = useCallback(async () => {
    const [usersRes, rolesRes] = await Promise.all([listUsers(), listRoles()])
    setState((prev) => nextState(prev, usersRes, rolesRes))
  }, [])

  // Carga inicial: inline (no `reload()`) para que el `setState` quede tras el
  // `await` y no se dispare síncronamente dentro del efecto.
  useEffect(() => {
    let active = true
    void (async () => {
      const [usersRes, rolesRes] = await Promise.all([listUsers(), listRoles()])
      if (active) setState((prev) => nextState(prev, usersRes, rolesRes))
    })()
    return () => {
      active = false
    }
  }, [])

  const create = useCallback(
    async (input: CreateUserInput): Promise<string | null> => {
      const created = await createUser({
        email: input.email,
        password: input.password,
        displayName: input.displayName,
      })
      if (!created.ok) return toMessage(created.error)

      for (const roleId of input.roleIds) {
        const assigned = await assignRole(created.value.id, roleId)
        if (!assigned.ok) {
          await reload()
          return toMessage(assigned.error)
        }
      }
      await reload()
      return null
    },
    [reload],
  )

  const update = useCallback(
    async (id: string, patch: UpdateUserInput, roleIds: string[]): Promise<string | null> => {
      const current = state.users.find((u) => u.id === id)
      const updated = await updateUser(id, patch)
      if (!updated.ok) return toMessage(updated.error)

      const before = new Set(current?.roleIds ?? [])
      const after = new Set(roleIds)
      const toAssign = [...after].filter((r) => !before.has(r))
      const toRevoke = [...before].filter((r) => !after.has(r))

      for (const roleId of toAssign) {
        const res = await assignRole(id, roleId)
        if (!res.ok) {
          await reload()
          return toMessage(res.error)
        }
      }
      for (const roleId of toRevoke) {
        const res = await revokeRole(id, roleId)
        if (!res.ok) {
          await reload()
          return toMessage(res.error)
        }
      }
      await reload()
      return null
    },
    [reload, state.users],
  )

  const setEnabled = useCallback(
    async (id: string, enabled: boolean): Promise<string | null> => {
      // Inhabilitar también es DELETE en Auth, pero PUT con `enabled` cubre ambos
      // sentidos (habilitar/inhabilitar) con un único contrato.
      const res = enabled ? await updateUser(id, { enabled: true }) : await disableUser(id)
      if (!res.ok) return toMessage(res.error)
      await reload()
      return null
    },
    [reload],
  )

  return { ...state, create, update, setEnabled, reload }
}
