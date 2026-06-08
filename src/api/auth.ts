import { env } from '@/env'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
}

export interface ErrorResponse {
  timestamp: string
  status: number
  error: string
  code?: string
  message: string
  path: string
  metadata?: Record<string, unknown>
}

export class AuthError extends Error {
  constructor(
    public statusCode: number,
    public code: string | undefined,
    message: string,
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${env.apiBaseUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    const error = (await response.json()) as ErrorResponse
    throw new AuthError(response.status, error.code, error.message)
  }

  return response.json() as Promise<LoginResponse>
}
