import { useState, type ComponentPropsWithoutRef, type FormEvent } from 'react'
import { CircleAlertIcon, EyeIcon, EyeOffIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import wordmark from '@/assets/logo/edutrack-wordmark.svg'

export interface LoginFormValues {
  email: string
  password: string
  remember: boolean
}

interface LoginFormProps extends Omit<ComponentPropsWithoutRef<'div'>, 'onSubmit'> {
  onSubmit: (values: LoginFormValues) => void
  loading?: boolean
  errorMessage?: string | null
  onForgotPassword?: () => void
  onRequestAccess?: () => void
}

export function LoginForm({
  onSubmit,
  loading = false,
  errorMessage,
  onForgotPassword,
  onRequestAccess,
  className,
  ...props
}: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [validationError, setValidationError] = useState('')

  const shownError = validationError || errorMessage

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!email.includes('@')) {
      setValidationError('Ingresa un correo institucional válido.')
      return
    }
    if (!password) {
      setValidationError('Ingresa tu contraseña.')
      return
    }
    setValidationError('')
    onSubmit({ email, password, remember })
  }

  return (
    <div className={cn('w-full max-w-[372px]', className)} {...props}>
      <img src={wordmark} alt="EduTrack" className="mb-5 h-7 w-auto lg:hidden" />

      <h1 className="text-[24px] leading-tight font-semibold tracking-tight">Iniciar sesión</h1>
      <p className="mt-1 mb-5 text-sm text-muted">Ingresa con tu correo institucional para continuar.</p>

      {shownError && (
        <div
          role="alert"
          className="mb-4 flex items-center gap-2 rounded-md border border-danger/20 bg-danger-soft px-3 py-2 text-xs font-medium text-danger"
        >
          <CircleAlertIcon aria-hidden className="size-[15px] shrink-0" />
          {shownError}
        </div>
      )}

      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field>
          <FieldLabel htmlFor="email">Correo institucional</FieldLabel>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="profesor@colegio.cl"
            autoComplete="username"
            disabled={loading}
            aria-invalid={shownError ? true : undefined}
          />
        </Field>

        <Field>
          <div className="flex items-baseline justify-between gap-3">
            <FieldLabel htmlFor="password">Contraseña</FieldLabel>
            <a
              href="#"
              className="text-xs whitespace-nowrap text-primary hover:underline"
              onClick={(e) => {
                e.preventDefault()
                onForgotPassword?.()
              }}
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={loading}
              className="pr-9"
            />
            <button
              type="button"
              tabIndex={-1}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute top-1/2 right-1 flex size-7 -translate-y-1/2 items-center justify-center rounded-sm text-muted hover:bg-surface hover:text-foreground"
            >
              {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
            </button>
          </div>
        </Field>

        <div className="flex items-center gap-2">
          <Checkbox
            id="remember"
            checked={remember}
            onCheckedChange={(checked) => setRemember(checked)}
            disabled={loading}
          />
          <Label htmlFor="remember" className="font-normal">
            Mantener sesión iniciada
          </Label>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
        </Button>

        <p className="text-center text-sm text-muted">
          ¿No tienes cuenta?{' '}
          <a
            href="#"
            className="font-medium text-primary hover:underline"
            onClick={(e) => {
              e.preventDefault()
              onRequestAccess?.()
            }}
          >
            Solicita acceso
          </a>
        </p>
      </form>

      <p className="mt-5 text-center text-xs leading-snug text-muted">
        Al continuar aceptas las políticas de uso de datos del establecimiento.
      </p>
    </div>
  )
}
