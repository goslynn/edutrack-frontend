import { useEffect, useState } from "react"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  Loader2Icon,
  XIcon,
} from "lucide-react"

import type { AuthRole, AuthUser } from "@/types/usuarios"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export interface UserDialogResult {
  email: string
  password: string
  displayName: string
  roleIds: string[]
}

interface UserDialogProps {
  mode: "create" | "edit"
  initial?: AuthUser
  /** Catálogo de roles asignables (de Auth). */
  availableRoles: AuthRole[]
  /** La mutación está en vuelo: bloquea los controles del diálogo. */
  submitting?: boolean
  onClose: () => void
  onSubmit: (data: UserDialogResult) => void
}

const genPassword = () => {
  const c = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789@#%"
  return Array.from(
    { length: 12 },
    () => c[Math.floor(Math.random() * c.length)]
  ).join("")
}
const emailOk = (e: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)

/** Alta/edición de usuario en dos pasos: ① Datos → ② Roles. */
export function UserDialog({
  mode,
  initial,
  availableRoles,
  submitting = false,
  onClose,
  onSubmit,
}: UserDialogProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState(initial?.email ?? "")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [displayName, setDisplayName] = useState(initial?.displayName ?? "")
  const [roleIds, setRoleIds] = useState<string[]>(initial ? [...initial.roleIds] : [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const step1Valid =
    displayName.trim() !== "" &&
    (mode === "edit" || (emailOk(email) && password.length >= 8))
  const toggleRole = (id: string) =>
    setRoleIds((rs) => (rs.includes(id) ? rs.filter((r) => r !== id) : [...rs, id]))

  const submit = () =>
    onSubmit({
      email: email.trim(),
      password,
      displayName: displayName.trim(),
      roleIds,
    })

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
        aria-label={mode === "edit" ? "Editar usuario" : "Nuevo usuario"}
        className="flex max-h-[92vh] w-full max-w-[482px] flex-col rounded-2xl bg-background shadow-lg"
      >
        <div className="flex items-start justify-between gap-3 px-[22px] pt-5">
          <div>
            <div className="text-[17px] font-semibold -tracking-[0.01em]">
              {mode === "edit" ? "Editar usuario" : "Nuevo usuario"}
            </div>
            <div className="mt-[3px] text-[13px] text-muted">
              {mode === "edit" ? initial?.email : "Crea una cuenta y asígnale roles."}
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

        {/* stepper */}
        <div className="flex items-center gap-3 px-[22px] pt-4 pb-0.5">
          <div
            className={cn(
              "flex items-center gap-2 text-[13px] font-semibold",
              step === 1 ? "text-primary" : "text-foreground"
            )}
          >
            <span
              className={cn(
                "grid size-6 place-items-center rounded-full text-[12.5px]",
                step === 1
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary-soft text-primary"
              )}
            >
              {step > 1 ? <CheckIcon className="size-3.5" /> : "1"}
            </span>
            Datos
          </div>
          <span className="h-px flex-1 bg-border" />
          <div
            className={cn(
              "flex items-center gap-2 text-[13px] font-semibold",
              step === 2 ? "text-primary" : "text-muted"
            )}
          >
            <span
              className={cn(
                "grid size-6 place-items-center rounded-full border border-border bg-surface text-[12.5px]",
                step === 2 && "border-transparent bg-primary text-primary-foreground"
              )}
            >
              2
            </span>
            Roles
          </div>
        </div>

        <div className="overflow-auto px-[22px] py-4">
          {step === 1 ? (
            <div className="flex flex-col gap-4">
              <Field>
                <FieldLabel htmlFor="f-email">Correo electrónico</FieldLabel>
                <Input
                  id="f-email"
                  type="email"
                  value={email}
                  disabled={mode === "edit"}
                  placeholder="nombre@colegioandes.cl"
                  onChange={(e) => setEmail(e.target.value)}
                />
                <FieldDescription>
                  {mode === "edit"
                    ? "El correo de acceso no se puede cambiar."
                    : "Se usará para iniciar sesión."}
                </FieldDescription>
              </Field>
              {mode === "create" && (
                <Field>
                  <FieldLabel htmlFor="f-pw">Contraseña</FieldLabel>
                  <div className="flex items-center gap-2">
                    <Input
                      id="f-pw"
                      type={showPw ? "text" : "password"}
                      value={password}
                      placeholder="••••••••"
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      aria-label={showPw ? "Ocultar" : "Mostrar"}
                      className="grid size-8 flex-none place-items-center rounded-md border border-border bg-background text-muted transition-colors outline-none hover:text-foreground"
                    >
                      {showPw ? (
                        <EyeOffIcon className="size-4" />
                      ) : (
                        <EyeIcon className="size-4" />
                      )}
                    </button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPassword(genPassword())
                        setShowPw(true)
                      }}
                    >
                      Generar
                    </Button>
                  </div>
                  <FieldDescription>Mínimo 8 caracteres.</FieldDescription>
                </Field>
              )}
              <Field>
                <FieldLabel htmlFor="f-name">Nombre visible</FieldLabel>
                <Input
                  id="f-name"
                  value={displayName}
                  maxLength={30}
                  placeholder="Juan Pérez"
                  onChange={(e) => setDisplayName(e.target.value)}
                />
                <FieldDescription>
                  Cómo aparecerá en la plataforma (máx. 30 caracteres).
                </FieldDescription>
              </Field>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="mb-0.5 text-[12.5px] leading-snug text-muted">
                Selecciona uno o más roles. Definen lo que el usuario puede ver y
                hacer.
              </div>
              {availableRoles.length === 0 && (
                <div className="rounded-lg border border-border bg-surface px-3.5 py-3 text-[12.5px] text-muted">
                  No hay roles disponibles todavía.
                </div>
              )}
              {availableRoles.map((r) => {
                const on = roleIds.includes(r.id)
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => toggleRole(r.id)}
                    className={cn(
                      "flex items-start gap-3 rounded-lg border bg-background px-3.5 py-3 text-left transition-colors outline-none",
                      on
                        ? "border-primary bg-primary-soft"
                        : "border-border hover:border-muted"
                    )}
                  >
                    <Checkbox checked={on} className="pointer-events-none mt-0.5" />
                    <span className="flex flex-col gap-0.5">
                      <span className="text-[13.5px] font-semibold">{r.name}</span>
                      {r.description && (
                        <span className="text-xs leading-snug text-muted">
                          {r.description}
                        </span>
                      )}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border px-[22px] pt-3.5 pb-[18px]">
          {step === 1 ? (
            <button
              type="button"
              onClick={onClose}
              className="px-1 py-1.5 text-[13px] font-semibold text-muted transition-colors outline-none hover:text-foreground"
            >
              Cancelar
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={submitting}
              className="inline-flex items-center gap-1 px-1 py-1.5 text-[13px] font-semibold text-muted transition-colors outline-none hover:text-foreground disabled:opacity-50"
            >
              <ArrowLeftIcon className="size-[15px]" /> Atrás
            </button>
          )}
          <div className="flex items-center gap-3">
            {step === 2 && (
              <span className="text-xs text-muted">
                {roleIds.length} {roleIds.length === 1 ? "rol" : "roles"} seleccionado
                {roleIds.length === 1 ? "" : "s"}
              </span>
            )}
            {step === 1 ? (
              <Button disabled={!step1Valid} onClick={() => setStep(2)}>
                Continuar <ArrowRightIcon />
              </Button>
            ) : (
              <Button disabled={submitting} onClick={submit}>
                {submitting ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <CheckIcon />
                )}
                {mode === "edit" ? "Guardar cambios" : "Crear usuario"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
