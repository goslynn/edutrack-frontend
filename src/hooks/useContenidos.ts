// ── Hook de feature: Contenido ───────────────────────────────────────
// Orquesta la carga y mutaciones del árbol de contenido vía el BFF. Carga
// inicial desde el composite GET (un round-trip); tras cada mutación exitosa
// recarga para que el shape sea exactamente el del backend.

import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  getContenidosBundle,
  createNode as createNodeApi,
  updateNode as updateNodeApi,
  deleteNode as deleteNodeApi,
  reorderNodes as reorderNodesApi,
  uploadFiles as uploadFilesApi,
  deleteFile as deleteFileApi,
  getDownloadLink as getDownloadLinkApi,
} from '@/api/contenidos'
import { failureToError } from '@/api/errors'
import type { HttpFailure } from '@/api/http-client'
import type { ErrorResponse } from '@/api/errors'
import type { ContentFile, ContentNode, Level, PermMap } from '@/types/contenidos'
import type { NodeForm } from '@/components/contenidos/node-dialog'
import type { ExplorerMutations } from '@/components/contenidos/explorer-panel'
import type { LinkResult } from '@/components/contenidos/download-dialog'

const toMsg = (failure: HttpFailure<ErrorResponse>): string => failureToError(failure).message

interface UseContenidosState {
  levels: Level[]
  nodes: ContentNode[]
  files: ContentFile[]
  loading: boolean
  error: string | null
}

export interface UseContenidosReturn extends UseContenidosState {
  perms: PermMap
  mutations: ExplorerMutations
  reload: () => Promise<void>
}

// Todos los permisos habilitados: RBAC por rol se resuelve en una fase posterior.
const ALL_ENABLED: PermMap = {
  'levels.create': 'enabled',
  'levels.edit': 'enabled',
  'levels.delete': 'enabled',
  'nodes.create': 'enabled',
  'nodes.edit': 'enabled',
  'nodes.delete': 'enabled',
  'files.upload': 'enabled',
  'files.delete': 'enabled',
}

export function useContenidos(): UseContenidosReturn {
  const [state, setState] = useState<UseContenidosState>({
    levels: [],
    nodes: [],
    files: [],
    loading: true,
    error: null,
  })

  const applyBundle = useCallback(
    (res: Awaited<ReturnType<typeof getContenidosBundle>>) =>
      setState((prev) => {
        if (!res.ok) return { ...prev, loading: false, error: toMsg(res.error) }
        return {
          levels: res.value.levels,
          nodes: res.value.nodes,
          files: res.value.files,
          loading: false,
          error: null,
        }
      }),
    [],
  )

  const reload = useCallback(async () => {
    applyBundle(await getContenidosBundle())
  }, [applyBundle])

  useEffect(() => {
    let active = true
    void (async () => {
      const res = await getContenidosBundle()
      if (active) applyBundle(res)
    })()
    return () => {
      active = false
    }
  }, [applyBundle])

  // ── Mutaciones (ExplorerMutations) ──────────────────────────────────
  const mutations: ExplorerMutations = useMemo(
    () => ({
      createNode: async (data: NodeForm, ctx) => {
        const res = await createNodeApi({
          name: data.name,
          description: data.description,
          orderIndex: data.orderIndex,
          levelId: ctx.levelId,
          parentId: ctx.parentId,
        })
        if (!res.ok) return toMsg(res.error)
        await reload()
        return null
      },
      updateNode: async (id, data) => {
        const res = await updateNodeApi(id, {
          name: data.name,
          description: data.description,
          orderIndex: data.orderIndex,
        })
        if (!res.ok) return toMsg(res.error)
        await reload()
        return null
      },
      deleteNode: async (node) => {
        const res = await deleteNodeApi(node.id)
        if (!res.ok) return toMsg(res.error)
        await reload()
        return null
      },
      reorderNodes: async (parentId, orderedIds) => {
        const res = await reorderNodesApi({ parentId, orderedIds })
        if (!res.ok) return toMsg(res.error)
        await reload()
        return null
      },
      uploadFiles: async (node, files) => {
        const res = await uploadFilesApi(node.id, files)
        if (!res.ok) return toMsg(res.error)
        await reload()
        return null
      },
      deleteFile: async (file) => {
        const res = await deleteFileApi(file.id)
        if (!res.ok) return toMsg(res.error)
        await reload()
        return null
      },
      requestLink: async (file): Promise<LinkResult> => {
        const res = await getDownloadLinkApi(file.id)
        return res.ok ? { link: res.value } : { error: toMsg(res.error) }
      },
    }),
    [reload],
  )

  return { ...state, perms: ALL_ENABLED, mutations, reload }
}
