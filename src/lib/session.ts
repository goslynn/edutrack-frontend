// ── Sesión ───────────────────────────────────────────────────────────
// Los tokens viven en cookies. Este módulo es el único que las conoce y es
// "la otra función" responsable de cargarlas en el cliente HTTP: el cliente
// específico solo almacena el token que aquí le entregamos (no lee cookies).

import { api, type EdutrackClient } from '@/api/client'
import { getCookie, setCookie, deleteCookie } from '@/lib/cookies'

const ACCESS_TOKEN = 'et_access_token'
const REFRESH_TOKEN = 'et_refresh_token'

/** Persistencia "mantener sesión iniciada": 7 días. */
const REMEMBER_MAX_AGE = 60 * 60 * 24 * 7

export interface SessionTokens {
  accessToken: string
  refreshToken: string
}

export interface SaveSessionOptions {
  /** `true` ⇒ cookies persistentes; `false` ⇒ cookies de sesión. */
  remember: boolean
}

/** Persiste los tokens en cookies e inyecta el access token en el cliente. */
export function saveSession(tokens: SessionTokens, { remember }: SaveSessionOptions): void {
  const maxAgeSeconds = remember ? REMEMBER_MAX_AGE : undefined
  setCookie(ACCESS_TOKEN, tokens.accessToken, { maxAgeSeconds })
  setCookie(REFRESH_TOKEN, tokens.refreshToken, { maxAgeSeconds })
  api.setAccessToken(tokens.accessToken)
}

/** Borra las cookies de sesión y limpia las credenciales del cliente. */
export function clearSession(): void {
  deleteCookie(ACCESS_TOKEN)
  deleteCookie(REFRESH_TOKEN)
  api.setAccessToken(null)
}

export function getAccessToken(): string | null {
  return getCookie(ACCESS_TOKEN)
}

export function getRefreshToken(): string | null {
  return getCookie(REFRESH_TOKEN)
}

export function isAuthenticated(): boolean {
  return getAccessToken() !== null
}

/** Decodifica el payload de un JWT (base64url) sin validar la firma. */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const part = token.split('.')[1]
  if (!part) return null
  try {
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return null
  }
}

/**
 * Id del usuario autenticado (claim `sub` del access token), o `null` si no hay
 * sesión o el token es ilegible. La firma la valida el Gateway; aquí solo se lee
 * para UX (p. ej. marcar la fila "Tú" y evitar que se inhabilite a sí mismo).
 */
export function getCurrentUserId(): string | null {
  const token = getAccessToken()
  if (!token) return null
  const sub = decodeJwtPayload(token)?.sub
  return typeof sub === 'string' ? sub : null
}

/**
 * Lee la cookie de access token y la inyecta en el cliente HTTP. Es la función
 * que cablea cookie → cliente; se llama al arrancar la app (bootstrap) para
 * rehidratar la sesión de un usuario que vuelve.
 */
export function loadSession(client: EdutrackClient = api): void {
  client.setAccessToken(getAccessToken())
}
