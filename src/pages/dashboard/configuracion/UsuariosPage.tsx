import { UsuariosPanel } from "@/components/configuracion/usuarios-panel"
import { useUsuarios } from "@/hooks/useUsuarios"
import { getCurrentUserId } from "@/lib/session"

/**
 * Container de Gestión de usuarios (`/dashboard/configuracion/usuarios`).
 * Cablea el hook de feature (`useUsuarios` → BFF → Auth) a la capa visual
 * (`UsuariosPanel`), que es puramente presentacional. "Volver" lo inyecta el
 * panel padre de Configuración.
 */
export function UsuariosPage({ onBack }: { onBack: () => void }) {
  const { users, roles, loading, error, create, update, setEnabled } = useUsuarios()

  return (
    <UsuariosPanel
      users={users}
      roles={roles}
      currentUserId={getCurrentUserId()}
      loading={loading}
      error={error}
      onCreate={create}
      onUpdate={update}
      onToggleEnabled={(user, enabled) => setEnabled(user.id, enabled)}
      onBack={onBack}
    />
  )
}
