import { useState } from 'react'
import { login, type LoginRequest, type LoginResponse } from '@/api/auth'

interface UseLoginState {
  data: LoginResponse | null
  loading: boolean
  error: Error | null
}

interface UseLoginReturn extends UseLoginState {
  execute: (credentials: LoginRequest) => Promise<LoginResponse>
}

export function useLogin(): UseLoginReturn {
  const [state, setState] = useState<UseLoginState>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = async (credentials: LoginRequest): Promise<LoginResponse> => {
    setState({ data: null, loading: true, error: null })
    try {
      const response = await login(credentials)
      setState({ data: response, loading: false, error: null })
      return response
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setState({ data: null, loading: false, error })
      console.debug(error)
      throw error
    }
  }

  return {
    ...state,
    execute,
  }
}
