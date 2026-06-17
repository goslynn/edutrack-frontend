import { useRef, useState } from "react"
import {
  ArrowLeftIcon,
  BanIcon,
  CircleCheckIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  SearchIcon,
  SendIcon,
  Trash2Icon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react"

import type { OrgUser, UserRole, UserStatus } from "@/types/configuracion"
import { cn } from "@/lib/utils"
import { Alert } from "@/components/ui/alert"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { UserDialog, type UserDialogResult } from "./user-dialog"

const STATUS: Record<UserStatus, { label: string; variant: "success" | "neutral" | "warning" }> = {
  activo: { label: "Activo", variant: "success" },
  inhabilitado: { label: "Inhabilitado", variant: "neutral" },
  pendiente: { label: "Pendiente", variant: "warning" },
}

function RoleBadges({ roleIds, roles }: { roleIds: string[]; roles: UserRole[] }) {
  const roleLabel = (id: string) => roles.find((r) => r.id === id)?.label ?? id
  const shown = roleIds.slice(0, 2)
  const extra = roleIds.length - shown.length
  return (
    <span className="inline-flex flex-wrap gap-1.5">
      {shown.map((r) => (
        <Badge key={r} variant={r === "admin" ? "primary" : "neutral"}>
          {roleLabel(r)}
        </Badge>
      ))}
      {extra > 0 && <Badge variant="neutral">+{extra}</Badge>}
    </span>
  )
}

interface RowMenuProps {
  user: OrgUser
  onEdit: (u: OrgUser) => void
  onToggle: (u: OrgUser) => void
  onResend: (u: OrgUser) => void
  onDelete: (u: OrgUser) => void
}

function RowMenu({ user, onEdit, onToggle, onResend, onDelete }: RowMenuProps) {
  const [open, setOpen] = useState(false)
  const item =
    "flex w-full items-center gap-2.5 rounded-sm px-2.5 py-2 text-[13px] font-medium text-foreground transition-colors outline-none hover:bg-surface [&_svg]:size-[15px] [&_svg]:flex-none [&_svg]:text-muted"
  return (
    <div className="relative inline-flex">
      <button
        type="button"
        aria-label="Acciones"
        onClick={() => setOpen((v) => !v)}
        className="grid size-8 place-items-center rounded-md text-muted transition-colors outline-none hover:bg-surface hover:text-foreground"
      >
        <EllipsisVerticalIcon className="size-[17px]" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div
            role="menu"
            className="absolute top-9 right-0 z-[31] min-w-[196px] rounded-lg border border-border bg-background p-1.5 shadow-lg"
          >
            <button
              type="button"
              className={item}
              onClick={() => {
                setOpen(false)
                onEdit(user)
              }}
            >
              <PencilIcon /> Editar
            </button>
            {user.status === "pendiente" && (
              <button
                type="button"
                className={item}
                onClick={() => {
                  setOpen(false)
                  onResend(user)
                }}
              >
                <SendIcon /> Reenviar invitación
              </button>
            )}
            {!user.you && user.status !== "inhabilitado" && (
              <button
                type="button"
                className={item}
                onClick={() => {
                  setOpen(false)
                  onToggle(user)
                }}
              >
                <BanIcon /> Inhabilitar
              </button>
            )}
            {!user.you && user.status === "inhabilitado" && (
              <button
                type="button"
                className={item}
                onClick={() => {
                  setOpen(false)
                  onToggle(user)
                }}
              >
                <CircleCheckIcon /> Habilitar
              </button>
            )}
            {!user.you && (
              <>
                <div className="my-1 h-px bg-border" />
                <button
                  type="button"
                  className={cn(item, "text-danger [&_svg]:text-danger")}
                  onClick={() => {
                    setOpen(false)
                    onDelete(user)
                  }}
                >
                  <Trash2Icon /> Eliminar
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

interface UsuariosPanelProps {
  /** Usuarios semilla (en producción, de Auth). */
  users: OrgUser[]
  /** Catálogo de roles para etiquetas y filtros (en producción, de Auth). */
  roles: UserRole[]
  onBack: () => void
}

/** Panel Usuarios: CRUD sobre el recurso usuario (listado + alta/edición + estado). */
export function UsuariosPanel({ users: seedUsers, roles, onBack }: UsuariosPanelProps) {
  const [users, setUsers] = useState<OrgUser[]>(() => seedUsers.map((u) => ({ ...u })))
  const [q, setQ] = useState("")
  const [roleF, setRoleF] = useState("all")
  const [statusF, setStatusF] = useState("all")
  const [dialog, setDialog] = useState<{ mode: "create" | "edit"; initial?: OrgUser } | null>(null)
  const [toast, setToast] = useState<{ variant: "success"; msg: string } | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const flash = (msg: string) => {
    setToast({ variant: "success", msg })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2600)
  }

  const filtered = users.filter((u) => {
    const t = (u.name + " " + u.email + " " + u.username).toLowerCase()
    if (q && !t.includes(q.toLowerCase())) return false
    if (roleF !== "all" && !u.roles.includes(roleF)) return false
    if (statusF !== "all" && u.status !== statusF) return false
    return true
  })

  const onToggle = (user: OrgUser) => {
    setUsers((us) =>
      us.map((u) =>
        u.id === user.id
          ? { ...u, status: u.status === "inhabilitado" ? "activo" : "inhabilitado" }
          : u
      )
    )
    flash(
      user.status === "inhabilitado"
        ? `${user.name} fue habilitado.`
        : `${user.name} fue inhabilitado.`
    )
  }
  const onResend = (user: OrgUser) => flash(`Invitación reenviada a ${user.email}.`)
  const onDelete = (user: OrgUser) => {
    setUsers((us) => us.filter((u) => u.id !== user.id))
    flash(`${user.name} fue eliminado.`)
  }

  const onSubmit = (data: UserDialogResult) => {
    if (dialog?.mode === "edit" && dialog.initial) {
      const id = dialog.initial.id
      setUsers((us) =>
        us.map((u) =>
          u.id === id
            ? { ...u, email: data.email, username: data.username, roles: data.roles }
            : u
        )
      )
      flash("Cambios guardados.")
    } else {
      const nu: OrgUser = {
        id: "u" + Date.now(),
        name: data.name,
        email: data.email,
        username: data.username,
        roles: data.roles,
        status: "activo",
        last: "recién",
      }
      setUsers((us) => [nu, ...us])
      flash(`${data.name} fue creado.`)
    }
    setDialog(null)
  }

  const activos = users.filter((u) => u.status === "activo").length

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
          <h1 className="text-2xl leading-tight font-semibold tracking-tight">
            Usuarios
          </h1>
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

      <div className="mb-3.5 flex flex-wrap gap-2.5">
        <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-muted">
          <SearchIcon className="size-4 flex-none" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre, correo o usuario…"
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
              {r.label}
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
          <option value="pendiente">Pendientes</option>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl bg-background ring-1 ring-foreground/10">
        <table className="w-full border-collapse">
          <thead>
            <tr className="[&>th]:border-b [&>th]:border-border [&>th]:bg-surface [&>th]:px-4 [&>th]:py-3 [&>th]:text-left [&>th]:text-[11.5px] [&>th]:font-semibold [&>th]:tracking-[0.05em] [&>th]:text-muted [&>th]:uppercase">
              <th>Usuario</th>
              <th>Roles</th>
              <th>Estado</th>
              <th className="hidden md:table-cell">Último acceso</th>
              <th aria-label="Acciones"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr
                key={u.id}
                className={cn(
                  "border-b border-border text-[13.5px] last:border-b-0 hover:bg-surface/55 [&>td]:px-4 [&>td]:py-[11px] [&>td]:align-middle",
                  u.status === "inhabilitado" && "opacity-55"
                )}
              >
                <td>
                  <div className="flex items-center gap-3">
                    <Avatar name={u.name} size="md" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-[13.5px] font-semibold">
                        {u.name}
                        {u.you && (
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
                  <RoleBadges roleIds={u.roles} roles={roles} />
                </td>
                <td>
                  <Badge variant={STATUS[u.status].variant} dot>
                    {STATUS[u.status].label}
                  </Badge>
                </td>
                <td className="hidden md:table-cell">
                  <span className="text-[13px] text-muted">{u.last}</span>
                </td>
                <td className="w-12 text-right">
                  <RowMenu
                    user={u}
                    onEdit={(x) => setDialog({ mode: "edit", initial: x })}
                    onToggle={onToggle}
                    onResend={onResend}
                    onDelete={onDelete}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 p-12 text-center text-[13.5px] text-muted">
            <UsersIcon className="size-[22px] text-border" />
            <div>No hay usuarios que coincidan con el filtro.</div>
          </div>
        )}
      </div>

      {dialog && (
        <UserDialog
          mode={dialog.mode}
          initial={dialog.initial}
          availableRoles={roles}
          onClose={() => setDialog(null)}
          onSubmit={onSubmit}
        />
      )}
    </div>
  )
}
