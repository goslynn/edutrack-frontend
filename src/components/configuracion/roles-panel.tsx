import { useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BookOpenIcon,
  CalendarCheckIcon,
  CheckIcon,
  ChevronRightIcon,
  FileBarChartIcon,
  GraduationCapIcon,
  InfoIcon,
  KeyRoundIcon,
  LockIcon,
  MessageSquareTextIcon,
  PlusIcon,
  ShieldCheckIcon,
  ShieldIcon,
  UsersIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react"

import type {
  PermFlag,
  PermService,
  Role,
  RolePermissions,
} from "@/types/configuracion"
import { cn } from "@/lib/utils"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

/* ---------- iconos de servicio (claves kebab → lucide) ---------- */
const SERVICE_ICONS: Record<string, LucideIcon> = {
  "book-open": BookOpenIcon,
  "graduation-cap": GraduationCapIcon,
  "calendar-check": CalendarCheckIcon,
  "message-square-text": MessageSquareTextIcon,
  "file-bar-chart": FileBarChartIcon,
  "shield-check": ShieldCheckIcon,
}

function ServiceIcon({ name, className }: { name: string; className?: string }) {
  const Icon = SERVICE_ICONS[name] ?? KeyRoundIcon
  return <Icon className={className} aria-hidden />
}

/* ---------- presentación del modelo de permisos (cómo se pinta) ---------- */

/** Bits del modelo UNIX expuestos como casillas (r=4 · w=2 · x=1). */
const permFlags: PermFlag[] = [
  { bit: 4, key: "read", label: "Lectura", short: "r", desc: "Ver el recurso." },
  { bit: 2, key: "write", label: "Escritura", short: "w", desc: "Crear y editar." },
  { bit: 1, key: "exec", label: "Ejecución", short: "x", desc: "Acciones y procesos (publicar, exportar…)." },
]

/**
 * Etiquetas legibles para cada resourceId (i18n del front; el backend solo
 * entrega los ids). Si falta una, la UI deriva el nombre del propio id.
 */
const resourceLabels: Record<string, string> = {
  "course.courses": "Cursos",
  "course.assignments": "Tareas y evaluaciones",
  "course.sections": "Asignaturas / secciones",
  "course.enrollments": "Matrículas",
  "grades.gradebook": "Libro de calificaciones",
  "grades.reportcards": "Informes de notas",
  "attendance.records": "Registro de asistencia",
  "attendance.justifications": "Justificativos",
  "annotations.entries": "Anotaciones",
  "reports.exports": "Exportación de datos",
  "reports.dashboards": "Tableros y reportes",
  "auth.users": "Usuarios",
  "auth.roles": "Roles y permisos",
}

/* ---------- helpers (modelo UNIX) ---------- */
const titleCase = (s: string) =>
  s
    .split(/[._\-\s]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ")
const resLabel = (id: string) =>
  resourceLabels[id] ?? titleCase(id.split(".").slice(1).join(".") || id)
const flagStr = (f: number) =>
  (f & 4 ? "r" : "-") + (f & 2 ? "w" : "-") + (f & 1 ? "x" : "-")
const grantedCount = (perms: Record<string, number> | undefined) =>
  Object.values(perms ?? {}).filter((v) => v > 0).length
const totalResources = (services: PermService[]) =>
  services.reduce((n, s) => n + s.response.meta.count, 0)

interface CatalogGroup {
  service: string
  label: string
  icon: string
  resources: { id: string; label: string }[]
}

const buildCatalog = (services: PermService[]): CatalogGroup[] =>
  services.map((s: PermService) => ({
    service: s.response.meta.service,
    label: s.label,
    icon: s.icon,
    resources: s.response.data.map((id) => ({ id, label: resLabel(id) })),
  }))

/** Rol en edición: una copia con sus permisos resueltos. */
type Draft = Role & { perms: Record<string, number> }

/* ======================================================================== */
/* LISTA de roles                                                           */
/* ======================================================================== */
function RoleListRow({
  role,
  perms,
  total,
  onOpen,
}: {
  role: Role
  perms: Record<string, number> | undefined
  total: number
  onOpen: (r: Role) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(role)}
      className="group flex w-full items-center gap-3.5 border-t border-border px-[18px] py-[15px] text-left transition-colors outline-none first:border-t-0 hover:bg-surface/55"
    >
      <span className="grid size-10 flex-none place-items-center rounded-[11px] bg-primary-soft text-primary">
        {role.system ? (
          <ShieldCheckIcon className="size-5" />
        ) : (
          <ShieldIcon className="size-5" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-[14.5px] font-semibold -tracking-[0.01em]">
          {role.name}
          {role.system && <Badge variant="neutral">Sistema</Badge>}
        </span>
        <span className="mt-[3px] block text-[12.5px] text-muted">
          {role.desc}
        </span>
      </span>
      <span className="flex flex-none items-center gap-4">
        <span
          title="Personas con este rol"
          className="hidden items-center gap-1.5 text-[12.5px] tabular-nums text-muted sm:inline-flex"
        >
          <UsersIcon className="size-3.5" /> {role.users}
        </span>
        <span
          title="Recursos con algún permiso"
          className="inline-flex items-center gap-1.5 text-[12.5px] tabular-nums text-muted"
        >
          <KeyRoundIcon className="size-3.5" /> {grantedCount(perms)}/
          {total}
        </span>
        <ChevronRightIcon className="size-[18px] text-muted transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
      </span>
    </button>
  )
}

/* ======================================================================== */
/* Modal: crear rol (solo nombre)                                           */
/* ======================================================================== */
function RoleCreateModal({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (data: { name: string; desc: string }) => void
}) {
  const [name, setName] = useState("")
  const [desc, setDesc] = useState("")

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const valid = name.trim().length >= 2
  const submit = () => {
    if (valid) onCreate({ name: name.trim(), desc: desc.trim() })
  }

  return (
    <div
      className="fixed inset-0 z-40 grid place-items-center bg-foreground/40 p-5"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Nuevo rol"
        className="flex max-h-[92vh] w-full max-w-[460px] flex-col rounded-2xl bg-background shadow-lg"
      >
        <div className="flex items-start justify-between gap-3 px-[22px] pt-5">
          <div>
            <div className="text-[17px] font-semibold -tracking-[0.01em]">
              Nuevo rol
            </div>
            <div className="mt-[3px] text-[13px] text-muted">
              Dale un nombre. En el siguiente paso defines sus permisos.
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="grid size-8 flex-none place-items-center rounded-md text-muted transition-colors outline-none hover:bg-surface hover:text-foreground"
          >
            <XIcon className="size-[18px]" />
          </button>
        </div>

        <div className="overflow-auto px-[22px] py-4">
          <div className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="r-name">Nombre del rol</FieldLabel>
              <Input
                id="r-name"
                value={name}
                autoFocus
                placeholder="p. ej. Coordinador de convivencia"
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submit()
                }}
              />
              <FieldDescription>
                Cómo aparecerá al asignarlo a las personas.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="r-desc">Descripción</FieldLabel>
              <Input
                id="r-desc"
                value={desc}
                placeholder="Opcional"
                onChange={(e) => setDesc(e.target.value)}
              />
              <FieldDescription>
                Opcional. Una línea sobre qué hace este rol.
              </FieldDescription>
            </Field>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border px-[22px] pt-3.5 pb-[18px]">
          <button
            type="button"
            onClick={onClose}
            className="px-1 py-1.5 text-[13px] font-semibold text-muted transition-colors outline-none hover:text-foreground"
          >
            Cancelar
          </button>
          <Button disabled={!valid} onClick={submit}>
            Continuar <ArrowRightIcon />
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ======================================================================== */
/* Matriz de permisos (un grupo por microservicio)                          */
/* ======================================================================== */
const MATRIX_COLS =
  "grid-cols-[minmax(0,1fr)_56px_56px_56px] sm:grid-cols-[minmax(0,1fr)_94px_94px_94px]"

function PermGroup({
  group,
  perms,
  setBit,
  setGroup,
}: {
  group: CatalogGroup
  perms: Record<string, number>
  setBit: (resId: string, bit: number, on: boolean) => void
  setGroup: (group: CatalogGroup, value: number) => void
}) {
  const groupGranted = group.resources.filter((r) => (perms[r.id] || 0) > 0).length
  const linkBtn =
    "inline-flex items-center border-0 bg-transparent px-1 py-1.5 text-[13px] font-semibold text-muted transition-colors outline-none hover:text-foreground"

  return (
    <>
      <div className="flex items-center gap-2.5 border-b border-border bg-surface/45 px-[22px] py-[11px]">
        <span className="grid size-[30px] flex-none place-items-center rounded-lg bg-background text-foreground ring-1 ring-foreground/10">
          <ServiceIcon name={group.icon} className="size-[17px]" />
        </span>
        <span className="min-w-0">
          <span className="text-[13px] font-bold -tracking-[0.01em]">
            {group.label}
          </span>
          <span className="font-mono text-[11px] text-muted"> · {group.service}</span>
        </span>
        <Badge variant={groupGranted ? "primary" : "neutral"}>
          {groupGranted}/{group.resources.length}
        </Badge>
        <span className="ml-auto flex gap-0.5">
          <button type="button" className={linkBtn} onClick={() => setGroup(group, 7)}>
            Todo
          </button>
          <button type="button" className={linkBtn} onClick={() => setGroup(group, 0)}>
            Ninguno
          </button>
        </span>
      </div>

      {group.resources.map((res) => {
        const f = perms[res.id] || 0
        return (
          <div
            key={res.id}
            className={cn(
              "grid items-center gap-2.5 border-b border-border px-[22px] py-[11px] transition-colors last:border-b-0 hover:bg-surface/[0.38]",
              MATRIX_COLS
            )}
          >
            <div className="min-w-0">
              <div className="text-[13.5px] font-semibold -tracking-[0.01em]">
                {res.label}
              </div>
              <div className="mt-1 flex items-center gap-2.5">
                <span className="font-mono text-[11px] text-muted">{res.id}</span>
                <span
                  className={cn(
                    "rounded-sm px-1.5 py-px font-mono text-[11px] font-semibold tracking-[0.12em]",
                    f ? "bg-primary-soft text-primary" : "bg-surface text-muted"
                  )}
                >
                  {flagStr(f)}
                </span>
              </div>
            </div>
            {permFlags.map((fl) => (
              <div key={fl.key} className="flex justify-center">
                <Checkbox
                  checked={(f & fl.bit) > 0}
                  aria-label={`${fl.label} — ${res.label}`}
                  onCheckedChange={(checked) => setBit(res.id, fl.bit, checked)}
                />
              </div>
            ))}
          </div>
        )
      })}
    </>
  )
}

function PermMatrix({
  catalog,
  perms,
  setBit,
  setGroup,
}: {
  catalog: CatalogGroup[]
  perms: Record<string, number>
  setBit: (resId: string, bit: number, on: boolean) => void
  setGroup: (group: CatalogGroup, value: number) => void
}) {
  return (
    <div className="overflow-hidden rounded-xl bg-background ring-1 ring-foreground/10">
      <div
        className={cn(
          "grid items-end gap-2.5 border-b border-border bg-surface px-[22px] py-[13px]",
          MATRIX_COLS
        )}
      >
        <div className="text-[11.5px] font-semibold tracking-[0.05em] text-muted uppercase">
          Recurso
        </div>
        {permFlags.map((fl) => (
          <div
            key={fl.key}
            title={fl.desc}
            className="text-center text-[11.5px] font-semibold tracking-[0.05em] text-muted uppercase"
          >
            <span className="hidden sm:inline">{fl.label}</span>
            <span className="mt-0.5 block font-mono text-[10px] tracking-normal text-muted normal-case">
              {fl.short} · {fl.bit}
            </span>
          </div>
        ))}
      </div>
      {catalog.map((g) => (
        <PermGroup
          key={g.service}
          group={g}
          perms={perms}
          setBit={setBit}
          setGroup={setGroup}
        />
      ))}
    </div>
  )
}

/* ======================================================================== */
/* EDITOR de un rol                                                         */
/* ======================================================================== */
function RoleEditor({
  role,
  mode,
  catalog,
  total,
  serviceCount,
  saving,
  onCancel,
  onApply,
}: {
  role: Draft
  mode: "create" | "edit"
  catalog: CatalogGroup[]
  total: number
  serviceCount: number
  saving: boolean
  onCancel: () => void
  onApply: (draft: Draft) => Promise<void>
}) {
  const [name, setName] = useState(role.name)
  const [perms, setPerms] = useState<Record<string, number>>(() => ({ ...role.perms }))

  const setBit = (resId: string, bit: number, on: boolean) =>
    setPerms((p) => {
      const cur = p[resId] || 0
      return { ...p, [resId]: on ? cur | bit : cur & ~bit }
    })
  const setGroup = (group: CatalogGroup, value: number) =>
    setPerms((p) => {
      const next = { ...p }
      group.resources.forEach((r) => {
        next[r.id] = value
      })
      return next
    })

  const granted = grantedCount(perms)
  const valid = name.trim().length >= 2

  return (
    <div className="mx-auto max-w-[1060px] px-8 pt-7 pb-16">
      <button
        type="button"
        onClick={onCancel}
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted transition-colors outline-none hover:text-primary"
      >
        <ArrowLeftIcon className="size-[15px]" /> Roles y permisos
      </button>

      <header className="mt-0.5 mb-[18px] flex items-start gap-[13px]">
        <span className="grid size-10 flex-none place-items-center rounded-[11px] bg-primary-soft text-primary">
          <ShieldIcon className="size-5" />
        </span>
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl leading-tight font-semibold tracking-tight">
            {mode === "create" ? "Nuevo rol" : "Editar rol"}
            {role.system && <Badge variant="neutral">Sistema</Badge>}
          </h1>
          <p className="mt-2 text-sm text-muted">
            Define qué puede ver y hacer este rol en cada recurso del sistema.
          </p>
        </div>
      </header>

      <div className="mb-[18px] rounded-xl bg-background px-[22px] py-[18px] ring-1 ring-foreground/10">
        <Field>
          <FieldLabel htmlFor="re-name">Nombre del rol</FieldLabel>
          <Input
            id="re-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={role.system}
            className="max-w-[380px]"
          />
          <FieldDescription>Lo único obligatorio de un rol.</FieldDescription>
        </Field>
        {role.system && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
            <LockIcon className="size-[13px] flex-none" /> Los roles de sistema no se
            pueden renombrar, pero sí ajustar sus permisos.
          </p>
        )}
      </div>

      <PermMatrix catalog={catalog} perms={perms} setBit={setBit} setGroup={setGroup} />

      <div className="sticky bottom-3.5 mt-[18px] flex flex-col items-stretch gap-3.5 rounded-xl border border-border bg-background/85 p-[13px_18px] shadow-md backdrop-blur-[8px] sm:flex-row sm:items-center sm:justify-between">
        <div className="text-[12.5px] tabular-nums text-muted">
          <strong className="text-foreground">{granted}</strong> de {total}{" "}
          recursos con permiso · {serviceCount} servicios
        </div>
        <div className="flex justify-end gap-2.5">
          <Button variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            disabled={!valid || saving}
            onClick={() => void onApply({ ...role, name: name.trim(), perms })}
          >
            {saving ? "Guardando…" : <><CheckIcon /> Aplicar</>}
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ======================================================================== */
/* PANEL principal                                                          */
/* ======================================================================== */
interface RolesPanelProps {
  /** Roles semilla (en producción, de Auth). */
  roles: Role[]
  /** Catálogo de recursos por microservicio (cada MS responde el suyo). */
  permServices: PermService[]
  /** Permisos asignados por rol { roleId: { resourceId: flagByte } }. */
  rolePermissions: RolePermissions
  /** Carga inicial en curso (muestra esqueleto en la lista). */
  loading?: boolean
  /** Error de carga (muestra alerta en la lista en lugar del contenido). */
  error?: string | null
  /** Si se pasa, crea el rol y sus permisos vía API. Devuelve `null` o mensaje de error. */
  onCreateRole?: (name: string, desc: string, perms: Record<string, number>) => Promise<string | null>
  /** Si se pasa, actualiza el rol y reconcilia permisos vía API. Devuelve `null` o mensaje de error. */
  onUpdateRole?: (id: string, name: string, perms: Record<string, number>) => Promise<string | null>
  onBack: () => void
}

/**
 * Roles y permisos: dos vistas en una. La LISTA muestra los roles existentes
 * ("Nuevo rol" solo pide un nombre); clicar uno o crear uno lleva al EDITOR,
 * que gestiona los permisos por recurso con las flags Lectura / Escritura /
 * Ejecución (modelo UNIX, r=4 · w=2 · x=1). Al pie: Cancelar · Aplicar.
 */
export function RolesPanel({
  roles: seedRoles,
  permServices,
  rolePermissions: seedPermissions,
  loading = false,
  error = null,
  onCreateRole,
  onUpdateRole,
  onBack,
}: RolesPanelProps) {
  const [roles, setRoles] = useState<Role[]>(() => seedRoles.map((r) => ({ ...r })))
  const [perms, setPerms] = useState<RolePermissions>(() =>
    structuredClone(seedPermissions)
  )
  const catalog = useMemo(() => buildCatalog(permServices), [permServices])
  const total = useMemo(() => totalResources(permServices), [permServices])
  const [editing, setEditing] = useState<{ role: Draft; mode: "create" | "edit" } | null>(
    null
  )
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ variant: "success" | "danger"; msg: string } | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Sincroniza el estado local cuando los props se recargan desde la API.
  useEffect(() => {
    setRoles(seedRoles.map((r) => ({ ...r })))
  }, [seedRoles])

  useEffect(() => {
    setPerms(structuredClone(seedPermissions))
  }, [seedPermissions])

  const flash = (msg: string, variant: "success" | "danger" = "success") => {
    setToast({ variant, msg })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3200)
  }

  const openExisting = (role: Role) =>
    setEditing({ role: { ...role, perms: perms[role.id] || {} }, mode: "edit" })

  const onCreate = ({ name, desc }: { name: string; desc: string }) => {
    setCreating(false)
    setEditing({
      role: { id: "r" + Date.now(), name, desc, system: false, users: 0, perms: {} },
      mode: "create",
    })
  }

  const onApply = async (draft: Draft) => {
    if (saving) return
    const mode = editing?.mode

    if (mode === "create" && onCreateRole) {
      setSaving(true)
      const err = await onCreateRole(draft.name, draft.desc, draft.perms)
      setSaving(false)
      if (err) { flash(err, "danger"); return }
      setEditing(null)
      flash(`Rol «${draft.name}» creado y permisos aplicados.`)
      return
    }

    if (mode === "edit" && onUpdateRole) {
      setSaving(true)
      const err = await onUpdateRole(draft.id, draft.name, draft.perms)
      setSaving(false)
      if (err) { flash(err, "danger"); return }
      setEditing(null)
      flash(`Permisos de «${draft.name}» actualizados.`)
      return
    }

    // Modo sin API (stub): actualiza solo estado local.
    setPerms((p) => ({ ...p, [draft.id]: draft.perms }))
    if (mode === "create") {
      setRoles((rs) => [
        { id: draft.id, name: draft.name, desc: draft.desc, system: false, users: 0 },
        ...rs,
      ])
      flash(`Rol «${draft.name}» creado y permisos aplicados.`)
    } else {
      setRoles((rs) =>
        rs.map((r) => (r.id === draft.id ? { ...r, name: draft.name } : r))
      )
      flash(`Permisos de «${draft.name}» actualizados.`)
    }
    setEditing(null)
  }

  if (editing) {
    return (
      <RoleEditor
        role={editing.role}
        mode={editing.mode}
        catalog={catalog}
        total={total}
        serviceCount={permServices.length}
        saving={saving}
        onCancel={() => setEditing(null)}
        onApply={onApply}
      />
    )
  }

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
            Roles y permisos
          </h1>
          <p className="mt-2 text-sm text-muted">
            {loading ? "Cargando…" : `${roles.length} roles · define qué puede ver y hacer cada uno.`}
          </p>
        </div>
        <Button onClick={() => setCreating(true)} disabled={loading}>
          <PlusIcon /> Nuevo rol
        </Button>
      </header>

      {error && (
        <div className="mb-3.5">
          <Alert variant="danger">{error}</Alert>
        </div>
      )}

      {toast && !error && (
        <div className="mb-3.5">
          <Alert variant={toast.variant}>{toast.msg}</Alert>
        </div>
      )}

      <div className="flex flex-col overflow-hidden rounded-xl bg-background ring-1 ring-foreground/10">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3.5 border-t border-border px-[18px] py-[15px] first:border-t-0"
            >
              <span className="size-10 flex-none animate-pulse rounded-[11px] bg-surface" />
              <span className="flex flex-1 flex-col gap-1.5">
                <span className="h-3.5 w-32 animate-pulse rounded bg-surface" />
                <span className="h-3 w-48 animate-pulse rounded bg-surface" />
              </span>
            </div>
          ))
        ) : (
          roles.map((r) => (
            <RoleListRow
              key={r.id}
              role={r}
              perms={perms[r.id]}
              total={total}
              onOpen={openExisting}
            />
          ))
        )}
      </div>

      <p className="mx-0.5 mt-3.5 flex items-center gap-1.5 text-[12.5px] leading-normal text-muted">
        <InfoIcon className="size-3.5 flex-none text-primary" /> Los permisos siguen el
        modelo UNIX — <b className="font-semibold text-foreground">Lectura (r)</b>,{" "}
        <b className="font-semibold text-foreground">Escritura (w)</b> y{" "}
        <b className="font-semibold text-foreground">Ejecución (x)</b> por recurso.
      </p>

      {creating && (
        <RoleCreateModal onClose={() => setCreating(false)} onCreate={onCreate} />
      )}
    </div>
  )
}
