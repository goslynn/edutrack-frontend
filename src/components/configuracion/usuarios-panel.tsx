import { useRef, useState } from "react"
import { Menu } from "@base-ui/react/menu"
import {
  ArrowLeftIcon,
  BanIcon,
  CircleCheckIcon,
  EllipsisVerticalIcon,
  Loader2Icon,
  PencilIcon,
  SearchIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react"

import type { AuthRole, AuthUser, CreateUserInput, UpdateUserInput } from "@/types/usuarios"
import { cn } from "@/lib/utils"
import { Alert } from "@/components/ui/alert"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { UserDialog, type UserDialogResult } from "./user-dialog"

function RoleBadges({ roleIds, roles }: { roleIds: string[]; roles: AuthRole[] }) {
  const roleLabel = (id: string) => roles.find((r) => r.id === id)?.name ?? id
  const shown = roleIds.slice(0, 2)
  const extra = roleIds.length - shown.length
  if (roleIds.length === 0) {
    return <span className="text-[12.5px] text-muted">Sin roles</span>
  }
  return (
    <span className="inline-flex flex-wrap gap-1.5">
      {shown.map((r) => (
        <Badge key={r} variant="neutral">
          {roleLabel(r)}
        </Badge>
      ))}
      {extra > 0 && <Badge variant="neutral">+{extra}</Badge>}
    </span>
  )
}

interface RowMenuProps {
  user: AuthUser
  self: boolean
  busy: boolean
  onEdit: (u: AuthUser) => void
  onToggle: (u: AuthUser) => void
}

function RowMenu({ user, self, busy, onEdit, onToggle }: RowMenuProps) {
  const item =
    "flex w-full cursor-pointer items-center gap-2.5 rounded-sm px-2.5 py-2 text-[13px] font-medium text-foreground transition-colors outline-none select-none hover:bg-surface data-[highlighted]:bg-surface data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:size-[15px] [&_svg]:flex-none [&_svg]:text-muted"
  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label="Acciones"
        className="grid size-8 place-items-center rounded-md text-muted transition-colors outline-none hover:bg-surface hover:text-foreground data-[popup-open]:bg-surface data-[popup-open]:text-foreground"
      >
        <EllipsisVerticalIcon className="size-[17px]" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align="end" sideOffset={6} className="z-50 outline-none">
          <Menu.Popup className="min-w-[196px] rounded-lg border border-border bg-background p-1.5 shadow-lg outline-none">
            <Menu.Item className={item} onClick={() => onEdit(user)}>
              <PencilIcon /> Editar
            </Menu.Item>
            {!self && (
              <Menu.Item className={item} disabled={busy} onClick={() => onToggle(user)}>
                {user.enabled ? (
                  <>
                    <BanIcon /> Inhabilitar
                  </>
                ) : (
                  <>
                    <CircleCheckIcon /> Habilitar
                  </>
                )}
              </Menu.Item>
            )}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}

interface UsuariosPanelProps {
  /** Usuarios entregados por Auth (vía BFF). El panel no mantiene copia local. */
  users: AuthUser[]
  /** Catálogo de roles para etiquetas, filtros y asignación. */
  roles: AuthRole[]
  /** Id del usuario autenticado: no puede inhabilitarse a sí mismo. */
  currentUserId?: string | null
  loading?: boolean
  /** Error de carga (cada mutación reporta su propio error vía los handlers). */
  error?: string | null
  onCreate: (input: CreateUserInput) => Promise<string | null>
  onUpdate: (id: string, patch: UpdateUserInput, roleIds: string[]) => Promise<string | null>
  onToggleEnabled: (user: AuthUser, enabled: boolean) => Promise<string | null>
  onBack: () => void
}

/** Panel Usuarios: listado + alta/edición + habilitar/inhabilitar sobre Auth. */
export function UsuariosPanel({
  users,
  roles,
  currentUserId,
  loading = false,
  error = null,
  onCreate,
  onUpdate,
  onToggleEnabled,
  onBack,
}: UsuariosPanelProps) {
  const [q, setQ] = useState("")
  const [roleF, setRoleF] = useState("all")
  const [statusF, setStatusF] = useState("all")
  const [dialog, setDialog] = useState<{ mode: "create" | "edit"; initial?: AuthUser } | null>(
    null
  )
  const [busyId, setBusyId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ variant: "success" | "danger"; msg: string } | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const flash = (variant: "success" | "danger", msg: string) => {
    setToast({ variant, msg })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3200)
  }

  const filtered = users.filter((u) => {
    const t = (u.displayName + " " + u.email).toLowerCase()
    if (q && !t.includes(q.toLowerCase())) return false
    if (roleF !== "all" && !u.roleIds.includes(roleF)) return false
    if (statusF === "activo" && !u.enabled) return false
    if (statusF === "inhabilitado" && u.enabled) return false
    return true
  })

  const onToggle = async (user: AuthUser) => {
    setBusyId(user.id)
    const err = await onToggleEnabled(user, !user.enabled)
    setBusyId(null)
    if (err) flash("danger", err)
    else
      flash(
        "success",
        user.enabled
          ? `${user.displayName} fue inhabilitado.`
          : `${user.displayName} fue habilitado.`
      )
  }

  const onSubmit = async (data: UserDialogResult) => {
    setSubmitting(true)
    if (dialog?.mode === "edit" && dialog.initial) {
      const err = await onUpdate(
        dialog.initial.id,
        { displayName: data.displayName },
        data.roleIds
      )
      setSubmitting(false)
      if (err) {
        flash("danger", err)
        return
      }
      flash("success", "Cambios guardados.")
    } else {
      const err = await onCreate({
        email: data.email,
        password: data.password,
        displayName: data.displayName,
        roleIds: data.roleIds,
      })
      setSubmitting(false)
      if (err) {
        flash("danger", err)
        return
      }
      flash("success", `${data.displayName} fue creado.`)
    }
    setDialog(null)
  }

  const activos = users.filter((u) => u.enabled).length

  return (
    <div className="mx-auto max-w-[1060px] px-8 pt-7 pb-16">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted transition-colors outline-none hover:text-primary"
      >
        <ArrowLeftIcon className="size-[15px]" /> Configuración
      </button>

      <header className="mt-0.5 mb-[18px] flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl leading-tight font-semibold tracking-tight">Usuarios</h1>
          <p className="mt-2 text-sm text-muted">
            {users.length} usuarios · {activos} activos en tu organización.
          </p>
        </div>
        <Button onClick={() => setDialog({ mode: "create" })}>
          <UserPlusIcon /> Nuevo usuario
        </Button>
      </header>

      {toast && (
        <div className="mb-3.5">
          <Alert variant={toast.variant}>{toast.msg}</Alert>
        </div>
      )}

      {error && (
        <div className="mb-3.5">
          <Alert variant="danger">{error}</Alert>
        </div>
      )}

      <div className="mb-3.5 flex flex-wrap gap-2.5">
        <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-muted">
          <SearchIcon className="size-4 flex-none" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre o correo…"
            className="w-full border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
          />
        </div>
        <Select
          value={roleF}
          onChange={(e) => setRoleF(e.target.value)}
          aria-label="Rol"
          wrapperClassName="min-w-[170px]"
        >
          <option value="all">Todos los roles</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </Select>
        <Select
          value={statusF}
          onChange={(e) => setStatusF(e.target.value)}
          aria-label="Estado"
          wrapperClassName="min-w-[170px]"
        >
          <option value="all">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="inhabilitado">Inhabilitados</option>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl bg-background ring-1 ring-foreground/10">
        <table className="w-full border-collapse">
          <thead>
            <tr className="[&>th]:border-b [&>th]:border-border [&>th]:bg-surface [&>th]:px-4 [&>th]:py-3 [&>th]:text-left [&>th]:text-[11.5px] [&>th]:font-semibold [&>th]:tracking-[0.05em] [&>th]:text-muted [&>th]:uppercase">
              <th>Usuario</th>
              <th>Roles</th>
              <th>Estado</th>
              <th aria-label="Acciones"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => {
              const self = u.id === currentUserId
              return (
                <tr
                  key={u.id}
                  className={cn(
                    "border-b border-border text-[13.5px] last:border-b-0 hover:bg-surface/55 [&>td]:px-4 [&>td]:py-[11px] [&>td]:align-middle",
                    !u.enabled && "opacity-55"
                  )}
                >
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar name={u.displayName} size="md" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-[13.5px] font-semibold">
                          {u.displayName}
                          {self && (
                            <span className="rounded-full bg-primary-soft px-1.5 py-px text-[10px] font-semibold tracking-[0.04em] text-primary uppercase">
                              Tú
                            </span>
                          )}
                        </div>
                        <div className="text-[12.5px] text-muted">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <RoleBadges roleIds={u.roleIds} roles={roles} />
                  </td>
                  <td>
                    <Badge variant={u.enabled ? "success" : "neutral"} dot>
                      {u.enabled ? "Activo" : "Inhabilitado"}
                    </Badge>
                  </td>
                  <td className="w-12 text-right">
                    <RowMenu
                      user={u}
                      self={self}
                      busy={busyId === u.id}
                      onEdit={(x) => setDialog({ mode: "edit", initial: x })}
                      onToggle={onToggle}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 p-12 text-center text-[13.5px] text-muted">
            <UsersIcon className="size-[22px] text-border" />
            <div>
              {users.length === 0
                ? "Aún no hay usuarios."
                : "No hay usuarios que coincidan con el filtro."}
            </div>
          </div>
        )}
        {loading && (
          <div className="flex items-center justify-center gap-2 p-12 text-[13.5px] text-muted">
            <Loader2Icon className="size-4 animate-spin" /> Cargando usuarios…
          </div>
        )}
      </div>

      {dialog && (
        <UserDialog
          mode={dialog.mode}
          initial={dialog.initial}
          availableRoles={roles}
          submitting={submitting}
          onClose={() => {
            if (!submitting) setDialog(null)
          }}
          onSubmit={onSubmit}
        />
      )}
    </div>
  )
}
