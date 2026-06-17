import { useState } from 'react'
import { login, type LoginRequest, type LoginResponse } from '@/api/auth'
import { failureToError } from '@/api/errors'

interface UseLoginState {
  data: LoginResponse | null
  loading: boolean
  error: Error | null
}

interface UseLoginReturn extends UseLoginState {
  /** Ejecuta el login; devuelve los tokens o `null` (el fallo queda en `error`). */
  execute: (credentials: LoginRequest) => Promise<LoginResponse | null>
}

export function useLogin(): UseLoginReturn {
  const [state, setState] = useState<UseLoginState>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = async (credentials: LoginRequest): Promise<LoginResponse | null> => {
    setState({ data: null, loading: true, error: null })

    const result = await login(credentials)
    if (result.ok) {
      setState({ data: result.value, loading: false, error: null })
      return result.value
    }

    const error = failureToError(result.error)
    setState({ data: null, loading: false, error })
    return null
  }

  return {
    ...state,
    execute,
  }
}
