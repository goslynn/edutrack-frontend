import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  clearSession,
  getAccessToken,
  getCurrentUserId,
  getRefreshToken,
  isAuthenticated,
  loadSession,
  saveSession,
} from './session'
import { api } from '@/api/client'

/** JWT de juguete con el claim `sub` indicado (firma irrelevante: no se valida). */
function jwtWithSub(sub: string): string {
  const payload = btoa(JSON.stringify({ sub }))
  return `header.${payload}.signature`
}

beforeEach(() => {
  clearSession()
})
afterEach(() => {
  clearSession()
})

describe('saveSession / getters', () => {
  it('persiste tokens y los inyecta en el cliente', () => {
    saveSession({ accessToken: 'acc', refreshToken: 'ref' }, { remember: true })
    expect(getAccessToken()).toBe('acc')
    expect(getRefreshToken()).toBe('ref')
    expect(isAuthenticated()).toBe(true)
    expect(api.getAccessToken()).toBe('acc')
  })

  it('remember=false también guarda (cookie de sesión)', () => {
    saveSession({ accessToken: 'acc2', refreshToken: 'ref2' }, { remember: false })
    expect(getAccessToken()).toBe('acc2')
  })
})

describe('clearSession', () => {
  it('borra cookies y credenciales del cliente', () => {
    saveSession({ accessToken: 'a', refreshToken: 'r' }, { remember: true })
    clearSession()
    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
    expect(isAuthenticated()).toBe(false)
    expect(api.hasAuth()).toBe(false)
  })
})

describe('getCurrentUserId', () => {
  it('sin sesión → null', () => {
    expect(getCurrentUserId()).toBeNull()
  })

  it('decodifica el claim sub del access token', () => {
    saveSession({ accessToken: jwtWithSub('user-9'), refreshToken: 'r' }, { remember: false })
    expect(getCurrentUserId()).toBe('user-9')
  })

  it('token malformado → null', () => {
    saveSession({ accessToken: 'no-es-un-jwt', refreshToken: 'r' }, { remember: false })
    expect(getCurrentUserId()).toBeNull()
  })

  it('payload no decodificable → null', () => {
    saveSession({ accessToken: 'h.%%%.s', refreshToken: 'r' }, { remember: false })
    expect(getCurrentUserId()).toBeNull()
  })
})

describe('loadSession', () => {
  it('inyecta el access token de la cookie en el cliente dado', () => {
    saveSession({ accessToken: 'cookie-token', refreshToken: 'r' }, { remember: false })
    let injected: string | null = 'sentinel'
    const fakeClient = {
      setAccessToken: (t: string | null) => { injected = t },
    } as Parameters<typeof loadSession>[0]
    loadSession(fakeClient)
    expect(injected).toBe('cookie-token')
  })
})
