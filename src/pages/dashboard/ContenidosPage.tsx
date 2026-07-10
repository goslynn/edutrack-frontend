import { ContenidosScreen } from "@/components/contenidos/contenidos-screen"
import { useContenidos } from "@/hooks/useContenidos"

/**
 * Sección Contenido (`/dashboard/contenidos`).
 * Cablea el hook de feature (`useContenidos` → BFF → MS-Content) a la capa
 * visual (`ContenidosScreen`), que es puramente presentacional.
 */
export function ContenidosPage() {
  const { levels, nodes, files, loading, error, perms, mutations } = useContenidos()

  return (
    <ContenidosScreen
      levels={levels}
      nodes={nodes}
      files={files}
      perms={perms}
      loading={loading}
      error={error}
      mutations={mutations}
    />
  )
}
