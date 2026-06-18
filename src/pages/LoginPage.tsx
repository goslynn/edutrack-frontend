import { Navigate, useNavigate } from 'react-router-dom'
import { useLogin } from '@/hooks/useLogin'
import { ApiError } from '@/api/errors'
import { saveSession, isAuthenticated, getCurrentUserId } from '@/lib/session'
import { getUserById } from '@/api/auth'
import { useAuth } from '@/context/AuthContext'
import { LoginBrandPane } from '@/components/login-brand-pane'
import { LoginForm, type LoginFormValues } from '@/components/login-form'

function loginErrorMessage(error: Error | null): string | null {
  if (!error) return null
  if (error instanceof ApiError) {
    if (error.response.status === 401) return 'Correo o contraseña incorrectos.'
    return error.response.message
  }
  return 'No se pudo iniciar sesión. Revisa tu conexión e intenta nuevamente.'
}

export function LoginPage() {
  const navigate = useNavigate()
  const { execute, loading, error } = useLogin()
  const { setUser } = useAuth()

  if (isAuthenticated()) return <Navigate to="/dashboard" replace />

  const handleSubmit = async ({ email, password, remember }: LoginFormValues) => {
    const tokens = await execute({ email, password })
    if (!tokens) return
    saveSession(tokens, { remember })
    const id = getCurrentUserId()
    if (id) {
      const result = await getUserById(id)
      if (result.ok) setUser(result.value)
    }
    navigate('/dashboard')
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <LoginBrandPane />
      <main className="flex items-center justify-center bg-background p-10">
        <LoginForm onSubmit={handleSubmit} loading={loading} errorMessage={loginErrorMessage(error)} />
      </main>
    </div>
  )
}
