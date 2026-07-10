import { useRef, useState } from "react"

import type { ContentFile, ContentNode, Level, PermMap } from "@/types/contenidos"
import { Alert } from "@/components/ui/alert"
import { ExplorerPanel, type ExplorerMutations } from "./explorer-panel"

type ToastVariant = "success" | "info" | "warning" | "danger"
type Toast = { variant: ToastVariant; msg: string; k: number } | null

interface ContenidosScreenProps {
  levels: Level[]
  nodes: ContentNode[]
  files: ContentFile[]
  perms: PermMap
  loading?: boolean
  error?: string | null
  mutations: ExplorerMutations
}

/**
 * Pantalla «Contenido»: cabecera + explorador del árbol jerárquico. El estado
 * de dominio (levels/nodes/files) llega del hook vía la página; aquí solo vive
 * el estado UI (toasts). La capa visual es puramente presentacional.
 */
export function ContenidosScreen({
  levels,
  nodes,
  files,
  perms,
  loading,
  error,
  mutations,
}: ContenidosScreenProps) {
  const [toast, setToast] = useState<Toast>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const flash = (variant: ToastVariant, msg: string) => {
    setToast({ variant, msg, k: Date.now() })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3200)
  }

  const empty = !levels.length && !nodes.length

  return (
    <div className="mx-auto max-w-[1180px] px-8 pt-[26px] pb-[72px]">
      <header className="mb-[18px] flex flex-wrap items-start justify-between gap-5">
        <div>
          <h1 className="text-2xl leading-tight font-semibold tracking-tight">Contenido</h1>
          <p className="mt-2 max-w-[62ch] text-sm text-muted text-pretty">
            Material de clases organizado como un árbol jerárquico configurable. Navega nivel por
            nivel y gestiona los archivos de cada clase.
          </p>
        </div>
      </header>

      {error && (
        <div className="mb-3.5">
          <Alert variant="danger">{error}</Alert>
        </div>
      )}

      {toast && (
        <div className="mb-3.5" key={toast.k}>
          <Alert variant={toast.variant}>{toast.msg}</Alert>
        </div>
      )}

      {loading && empty ? (
        <div className="flex items-center justify-center py-20 text-[13.5px] text-muted">Cargando…</div>
      ) : (
        <ExplorerPanel
          levels={levels}
          nodes={nodes}
          files={files}
          perms={perms}
          mutations={mutations}
          flash={flash}
        />
      )}
    </div>
  )
}
