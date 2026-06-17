// ── Cliente específico de EduTrack ───────────────────────────────────
// Implementación "específica" sobre el cliente genérico: inyecta el
// `env.apiBaseUrl` como base de toda request y el header `Authorization:
// Bearer <token>` cuando hay credenciales.
//
// El cliente NO sabe de dónde sale el token: solo almacena la variable que
// alguien le pasa vía `setAccessToken`. Quién lee las cookies y se lo entrega
// es otra función (ver `lib/session.ts` → `loadSession`).

import { env } from '@/env'
import { createHttpClient, type HttpClient } from './http-client'

export interface EdutrackClient extends HttpClient {
  /** Guarda (o limpia con `null`) el bearer token que se inyectará en cada request. */
  setAccessToken(token: string | null): void
  /** Token actualmente en memoria, o `null` si no hay sesión cargada. */
  getAccessToken(): string | null
  /** ¿El cliente tiene credenciales para autenticar? */
  hasAuth(): boolean
}

export function createEdutrackClient(baseUrl: string = env.apiBaseUrl): EdutrackClient {
  let accessToken: string | null = null

  const http = createHttpClient({
    baseUrl,
    getHeaders: (): Record<string, string> =>
      accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    defaults: {
      // Timeout sano para toda la app. Los reintentos siguen siendo opt-in por
      // request (`{ retry: ... }`) para no reintentar POSTs no idempotentes.
      timeoutMs: 15_000,
    },
  })

  return {
    ...http,
    setAccessToken: (token) => {
      accessToken = token
    },
    getAccessToken: () => accessToken,
    hasAuth: () => accessToken !== null,
  }
}

/** Instancia singleton usada por la capa de recursos (`api/<servicio>.ts`). */
export const api = createEdutrackClient()
