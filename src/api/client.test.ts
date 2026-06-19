import { afterEach, describe, expect, it, vi } from 'vitest'
import { createEdutrackClient } from './client'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('createEdutrackClient', () => {
  it('arranca sin credenciales', () => {
    const c = createEdutrackClient('https://api.test')
    expect(c.hasAuth()).toBe(false)
    expect(c.getAccessToken()).toBeNull()
  })

  it('setAccessToken guarda el token y lo refleja en hasAuth', () => {
    const c = createEdutrackClient('https://api.test')
    c.setAccessToken('abc')
    expect(c.getAccessToken()).toBe('abc')
    expect(c.hasAuth()).toBe(true)
    c.setAccessToken(null)
    expect(c.hasAuth()).toBe(false)
  })

  it('inyecta Authorization: Bearer cuando hay token', async () => {
    const fetchFn = vi.fn(() => new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } }))
    vi.stubGlobal('fetch', fetchFn)

    const c = createEdutrackClient('https://api.test')
    c.setAccessToken('tok-123')
    await c.get('/auth/me')

    const init = fetchFn.mock.calls[0][1] as RequestInit
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer tok-123')
    expect(fetchFn.mock.calls[0][0]).toBe('https://api.test/auth/me')
  })

  it('sin token no manda Authorization', async () => {
    const fetchFn = vi.fn(() => new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } }))
    vi.stubGlobal('fetch', fetchFn)
    const c = createEdutrackClient('https://api.test')
    await c.get('/x')
    const init = fetchFn.mock.calls[0][1] as RequestInit
    expect((init.headers as Record<string, string>).Authorization).toBeUndefined()
  })
})
