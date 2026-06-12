import { useNavigate } from 'react-router-dom'
import { useLogin } from '@/hooks/useLogin'
import { ApiError } from '@/api/auth'
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

  const handleSubmit = async ({ email, password, remember }: LoginFormValues) => {
    try {
      const { accessToken, refreshToken } = await execute({ email, password })
      const storage = remember ? localStorage : sessionStorage
      storage.setItem('accessToken', accessToken)
      storage.setItem('refreshToken', refreshToken)
      navigate('/dashboard')
    } catch {
      // el error queda en el estado de useLogin y se muestra en el formulario
    }
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
