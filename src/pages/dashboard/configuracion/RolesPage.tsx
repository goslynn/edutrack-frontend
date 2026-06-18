import { RolesPanel } from "@/components/configuracion/roles-panel"
import { useRoles } from "@/hooks/useRoles"

/**
 * Container de Roles y permisos (`/dashboard/configuracion/roles`).
 * Cablea `useRoles` (BFF → Auth) a la capa visual (`RolesPanel`).
 */
export function RolesPage({ onBack }: { onBack: () => void }) {
  const {
    roles,
    permServices,
    rolePermissions,
    loading,
    error,
    createRoleWithPerms,
    updateRoleWithPerms,
  } = useRoles()

  return (
    <RolesPanel
      roles={roles}
      permServices={permServices}
      rolePermissions={rolePermissions}
      loading={loading}
      error={error}
      onCreateRole={createRoleWithPerms}
      onUpdateRole={updateRoleWithPerms}
      onBack={onBack}
    />
  )
}
