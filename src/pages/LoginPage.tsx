import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LoginForm } from '@/components/login-form'
import { useLogin } from '@/hooks/useLogin'
import type { LoginRequest } from '@/api/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const { execute, loading, error } = useLogin()
  const [validationError, setValidationError] = useState<string>('')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setValidationError('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
      setValidationError('Email y contraseña son requeridos')
      return
    }

    try {
      const credentials: LoginRequest = { email, password }
      const response = await execute(credentials)

      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)

      navigate('/dashboard')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión'
      setValidationError(message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <LoginForm onSubmit={handleSubmit} />

        {(validationError || error) && (
          <div className="mt-4 p-4 rounded-md bg-danger text-danger-foreground text-sm">
            {validationError || error?.message}
          </div>
        )}

        {loading && (
          <div className="mt-4 p-4 rounded-md bg-primary text-primary-foreground text-sm text-center">
            Iniciando sesión...
          </div>
        )}
      </div>
    </div>
  )
}
