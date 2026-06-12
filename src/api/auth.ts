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
  metadata?: Record<string, unknown>
}

export class ApiError extends Error {
  readonly response: ErrorResponse

  constructor(response: ErrorResponse) {
    super(response.message)
    this.name = 'ApiError'
    this.response = response
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
    throw new ApiError((await response.json()) as ErrorResponse)
  }

  return (await response.json()) as LoginResponse
}
