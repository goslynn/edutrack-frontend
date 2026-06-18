import { useCallback, useEffect, useState } from 'react'

import {
  createRole,
  deleteRolePermission,
  getResourceCatalog,
  listRolePermissions,
  listRoles,
  updateRole,
  upsertRolePermission,
} from '@/api/configuracion'
import { failureToError } from '@/api/errors'
import type { HttpFailure } from '@/api/http-client'
import type { ErrorResponse } from '@/api/errors'
import type { PermService, Role, RolePermissions } from '@/types/configuracion'
import type { ResourceCatalogResponse, ServiceResources } from '@/types/usuarios'

const toMessage = (failure: HttpFailure<ErrorResponse>): string =>
  failureToError(failure).message

// ── Mapeo service → label / icon ─────────────────────────────────────
// Define cómo se presenta cada microservicio en la matriz de permisos.
const SERVICE_META: Record<string, { label: string; icon: string }> = {
  auth:       { label: 'Usuarios y acceso', icon: 'shield-check' },
  course:     { label: 'Cursos',            icon: 'book-open' },
  student:    { label: 'Estudiantes',       icon: 'graduation-cap' },
  attendance: { label: 'Asistencia',        icon: 'calendar-check' },
  annotation: { label: 'Anotaciones',       icon: 'message-square-text' },
  assessment: { label: 'Evaluaciones',      icon: 'file-bar-chart' },
}

function catalogToPermServices(catalog: ResourceCatalogResponse): PermService[] {
  const entries = Object.entries(catalog) as [string, ServiceResources | undefined][]
  return entries
    .filter((entry): entry is [string, ServiceResources] => entry[1] != null)
    .map(([key, svc]) => ({
      label: SERVICE_META[key]?.label ?? key,
      icon:  SERVICE_META[key]?.icon  ?? 'key-round',
      response: svc,
    }))
}

interface UseRolesState {
  roles: Role[]
  permServices: PermService[]
  rolePermissions: RolePermissions
  loading: boolean
  error: string | null
}

export interface UseRolesReturn extends UseRolesState {
  /**
   * Crea un rol y le aplica los permisos dados (solo los flags > 0).
   * Devuelve el mensaje de error o `null` si todo fue bien.
   */
  createRoleWithPerms: (
    name: string,
    desc: string,
    perms: Record<string, number>,
  ) => Promise<string | null>
  /**
   * Actualiza el nombre del rol y reconcilia sus permisos (upsert los activos,
   * elimina los que quedaron en 0 si antes tenían valor).
   */
  updateRoleWithPerms: (
    id: string,
    name: string,
    perms: Record<string, number>,
  ) => Promise<string | null>
  reload: () => Promise<void>
}

export function useRoles(): UseRolesReturn {
  const [state, setState] = useState<UseRolesState>({
    roles: [],
    permServices: [],
    rolePermissions: {},
    loading: true,
    error: null,
  })

  const load = useCallback(async () => {
    const [rolesRes, catalogRes] = await Promise.all([listRoles(), getResourceCatalog()])

    if (!rolesRes.ok) {
      setState((p) => ({ ...p, loading: false, error: toMessage(rolesRes.error) }))
      return
    }
    if (!catalogRes.ok) {
      setState((p) => ({ ...p, loading: false, error: toMessage(catalogRes.error) }))
      return
    }

    const authRoles = rolesRes.value
    const catalog   = catalogRes.value

    // Carga los permisos de todos los roles en paralelo.
    const permsResults = await Promise.all(
      authRoles.map((r) => listRolePermissions(r.id).then((res) => ({ id: r.id, res }))),
    )

    const rolePermissions: RolePermissions = {}
    for (const { id, res } of permsResults) {
      if (res.ok) {
        rolePermissions[id] = Object.fromEntries(
          res.value.map((p) => [p.resourceKey, p.flags]),
        )
      }
      // Si un rol falla al cargar permisos, se trata como sin permisos (no bloquea).
    }

    const roles: Role[] = authRoles.map((r) => ({
      id:     r.id,
      name:   r.name,
      desc:   r.description ?? '',
      system: false,
      users:  0,
    }))

    setState({
      roles,
      permServices: catalogToPermServices(catalog),
      rolePermissions,
      loading: false,
      error: null,
    })
  }, [])

  const reload = useCallback(async () => {
    setState((p) => ({ ...p, loading: true }))
    await load()
  }, [load])

  useEffect(() => {
    let active = true
    void load().then(() => { if (!active) setState((p) => ({ ...p })) })
    return () => { active = false }
  }, [load])

  const createRoleWithPerms = useCallback(
    async (name: string, desc: string, perms: Record<string, number>): Promise<string | null> => {
      const created = await createRole({ name, description: desc || undefined })
      if (!created.ok) return toMessage(created.error)

      const roleId = created.value.id
      const grants = Object.entries(perms).filter(([, f]) => f > 0)
      for (const [resourceKey, flags] of grants) {
        const res = await upsertRolePermission(roleId, resourceKey, flags)
        if (!res.ok) {
          await reload()
          return toMessage(res.error)
        }
      }
      await reload()
      return null
    },
    [reload],
  )

  const updateRoleWithPerms = useCallback(
    async (id: string, name: string, perms: Record<string, number>): Promise<string | null> => {
      const updated = await updateRole(id, { name })
      if (!updated.ok) return toMessage(updated.error)

      const prev = state.rolePermissions[id] ?? {}

      // Upsert los que tienen flags > 0.
      for (const [resourceKey, flags] of Object.entries(perms)) {
        if (flags > 0) {
          const res = await upsertRolePermission(id, resourceKey, flags)
          if (!res.ok) {
            await reload()
            return toMessage(res.error)
          }
        }
      }

      // Elimina los que existían antes y ahora tienen flags = 0.
      for (const resourceKey of Object.keys(prev)) {
        if ((perms[resourceKey] ?? 0) === 0 && prev[resourceKey] > 0) {
          const res = await deleteRolePermission(id, resourceKey)
          if (!res.ok) {
            await reload()
            return toMessage(res.error)
          }
        }
      }

      await reload()
      return null
    },
    [reload, state.rolePermissions],
  )

  return { ...state, createRoleWithPerms, updateRoleWithPerms, reload }
}
