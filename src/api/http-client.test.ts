import { afterEach, describe, expect, it, vi } from 'vitest'
import { createHttpClient, HttpError, type HttpFailure } from './http-client'

function json(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...init,
  })
}

function mockFetch(impl: (url: string, init: RequestInit) => Response | Promise<Response>) {
  const fn = vi.fn(impl as never)
  vi.stubGlobal('fetch', fn)
  return fn
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

const client = () => createHttpClient({ baseUrl: 'https://api.test' })

describe('peticiones exitosas', () => {
  it('GET json arma url con baseUrl + path + query y devuelve Ok', async () => {
    const fetchFn = mockFetch(() => json({ a: 1 }))
    const res = await client().get<{ a: number }>('/users', { query: { page: 2 } })
    expect(res).toEqual({ ok: true, value: { a: 1 } })
    const [url, init] = fetchFn.mock.calls[0]
    expect(url).toBe('https://api.test/users?page=2')
    expect(init.method).toBe('GET')
  })

  it('mergea headers default + getHeaders + por-request', async () => {
    const fetchFn = mockFetch(() => json({}))
    const c = createHttpClient({
      baseUrl: 'https://api.test',
      defaults: { headers: { 'X-Default': 'd' } },
      getHeaders: () => ({ Authorization: 'Bearer t' }),
    })
    await c.get('/x', { headers: { 'X-Req': 'r' } })
    const init = fetchFn.mock.calls[0][1]
    expect(init.headers).toMatchObject({ 'X-Default': 'd', Authorization: 'Bearer t', 'X-Req': 'r' })
  })

  it('POST con objeto serializa a JSON y agrega Content-Type', async () => {
    const fetchFn = mockFetch(() => json({ id: 1 }))
    await client().post('/users', { name: 'Ana' })
    const init = fetchFn.mock.calls[0][1] as RequestInit
    expect(init.body).toBe('{"name":"Ana"}')
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json')
  })

  it('POST con body crudo (string) no lo serializa ni fuerza Content-Type', async () => {
    const fetchFn = mockFetch(() => json({}))
    await client().post('/raw', 'texto-plano')
    const init = fetchFn.mock.calls[0][1] as RequestInit
    expect(init.body).toBe('texto-plano')
    expect((init.headers as Record<string, string>)['Content-Type']).toBeUndefined()
  })

  it('responseType text devuelve el texto', async () => {
    mockFetch(() => new Response('hola', { status: 200 }))
    const res = await client().get<string>('/t', { responseType: 'text' })
    expect(res).toEqual({ ok: true, value: 'hola' })
  })

  it('responseType none devuelve undefined', async () => {
    mockFetch(() => json({ ignored: true }))
    const res = await client().get('/n', { responseType: 'none' })
    expect(res).toEqual({ ok: true, value: undefined })
  })

  it('204 devuelve undefined aunque pidamos json', async () => {
    mockFetch(() => new Response(null, { status: 204 }))
    const res = await client().delete('/d')
    expect(res).toEqual({ ok: true, value: undefined })
  })

  it('responseType blob y arrayBuffer', async () => {
    mockFetch(() => new Response('bin', { status: 200 }))
    const blob = await client().get('/b', { responseType: 'blob' })
    expect(blob.ok).toBe(true)
    mockFetch(() => new Response('bin', { status: 200 }))
    const buf = await client().get('/a', { responseType: 'arrayBuffer' })
    expect(buf.ok).toBe(true)
  })

  it('json vacío devuelve undefined', async () => {
    mockFetch(() => new Response('', { status: 200 }))
    const res = await client().get('/empty')
    expect(res).toEqual({ ok: true, value: undefined })
  })

  it('todos los verbos despachan su método', async () => {
    const fetchFn = mockFetch(() => json({}))
    const c = client()
    await c.put('/p', {})
    await c.patch('/p', {})
    await c.request({ method: 'GET', path: '/r' })
    const methods = fetchFn.mock.calls.map((c) => (c[1] as RequestInit).method)
    expect(methods).toEqual(['PUT', 'PATCH', 'GET'])
  })
})

describe('fallos', () => {
  it('respuesta no-2xx con envelope json → Err http con body parseado', async () => {
    mockFetch(() => json({ status: 409, message: 'dup' }, { status: 409, statusText: 'Conflict' }))
    const res = await client().get('/x')
    expect(res.ok).toBe(false)
    if (!res.ok) {
      const f = res.error as Extract<HttpFailure, { kind: 'http' }>
      expect(f.kind).toBe('http')
      expect(f.status).toBe(409)
      expect(f.body).toEqual({ status: 409, message: 'dup' })
    }
  })

  it('error no-2xx con cuerpo no-json → body es el texto', async () => {
    mockFetch(() => new Response('boom', { status: 500, statusText: 'Server Error' }))
    const res = await client().get('/x')
    if (!res.ok) {
      const f = res.error as Extract<HttpFailure, { kind: 'http' }>
      expect(f.body).toBe('boom')
    }
  })

  it('fetch que lanza → Err network', async () => {
    mockFetch(() => { throw new TypeError('offline') })
    const res = await client().get('/x')
    expect(res).toMatchObject({ ok: false, error: { kind: 'network' } })
  })

  it('json inválido en 2xx → Err parse', async () => {
    mockFetch(() => new Response('{no-json', { status: 200 }))
    const res = await client().get('/x')
    expect(res).toMatchObject({ ok: false, error: { kind: 'parse' } })
  })

  it('signal externa ya abortada → Err aborted', async () => {
    mockFetch((_u, init) => new Promise((_res, reject) => {
      if (init.signal?.aborted) reject(new DOMException('aborted', 'AbortError'))
    }))
    const controller = new AbortController()
    controller.abort()
    const res = await client().get('/x', { signal: controller.signal })
    expect(res).toMatchObject({ ok: false, error: { kind: 'aborted' } })
  })

  it('timeout → Err timeout', async () => {
    vi.useFakeTimers()
    mockFetch((_u, init) => new Promise((_res, reject) => {
      init.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))
    }))
    const p = client().get('/slow', { timeoutMs: 1000 })
    await vi.advanceTimersByTimeAsync(1000)
    const res = await p
    expect(res).toMatchObject({ ok: false, error: { kind: 'timeout', timeoutMs: 1000 } })
  })
})

describe('reintentos', () => {
  it('reintenta ante fallo de red y termina en Ok', async () => {
    let n = 0
    const fetchFn = mockFetch(() => {
      n++
      if (n < 3) throw new TypeError('net')
      return json({ ok: 1 })
    })
    const res = await client().get('/x', { retry: 2 })
    expect(res.ok).toBe(true)
    expect(fetchFn).toHaveBeenCalledTimes(3)
  })

  it('agota los strikes y devuelve el Err', async () => {
    const fetchFn = mockFetch(() => { throw new TypeError('net') })
    const res = await client().get('/x', { retry: { strikes: 1 } })
    expect(res.ok).toBe(false)
    expect(fetchFn).toHaveBeenCalledTimes(2)
  })

  it('reintenta 5xx y 429 por defecto, no 4xx', async () => {
    let calls = 0
    mockFetch(() => { calls++; return new Response('e', { status: 503 }) })
    await client().get('/x', { retry: 1 })
    expect(calls).toBe(2)

    calls = 0
    mockFetch(() => { calls++; return new Response('e', { status: 400 }) })
    await client().get('/x', { retry: 1 })
    expect(calls).toBe(1) // 400 no reintenta
  })

  it('retryOn personalizado decide el reintento', async () => {
    let calls = 0
    mockFetch(() => { calls++; return new Response('e', { status: 400 }) })
    await client().get('/x', { retry: { strikes: 1, retryOn: (f) => f.kind === 'http' && f.status === 400 } })
    expect(calls).toBe(2)
  })

  it('respeta el delay con backoff exponencial', async () => {
    vi.useFakeTimers()
    let calls = 0
    mockFetch(() => { calls++; if (calls < 3) throw new TypeError('net'); return json({}) })
    const p = client().get('/x', { retry: { strikes: 2, delayMs: 100, backoff: 'exponential' } })
    await vi.advanceTimersByTimeAsync(100) // primer reintento
    await vi.advanceTimersByTimeAsync(200) // segundo: 100 * 2^1
    const res = await p
    expect(res.ok).toBe(true)
    expect(calls).toBe(3)
  })
})

describe('throwOnError', () => {
  it('lanza HttpError ante fallo', async () => {
    mockFetch(() => new Response('e', { status: 500, statusText: 'Server Error' }))
    await expect(client().get('/x', { throwOnError: true })).rejects.toBeInstanceOf(HttpError)
  })

  it('devuelve el valor pelado en éxito', async () => {
    mockFetch(() => json({ v: 1 }))
    const value = await client().get<{ v: number }>('/x', { throwOnError: true })
    expect(value).toEqual({ v: 1 })
  })

  it('default del cliente aplica a todo request', async () => {
    mockFetch(() => new Response('e', { status: 500 }))
    const c = createHttpClient({ baseUrl: 'https://api.test', defaults: { throwOnError: true } })
    await expect(c.get('/x')).rejects.toBeInstanceOf(HttpError)
  })
})

describe('HttpError mensaje por tipo de fallo', () => {
  it.each([
    [{ kind: 'http', status: 404, statusText: 'Not Found', body: null, response: {} as Response }, 'HTTP 404 Not Found'],
    [{ kind: 'network', error: null }, 'Error de red'],
    [{ kind: 'timeout', timeoutMs: 50 }, 'Timeout tras 50ms'],
    [{ kind: 'aborted' }, 'Request cancelado'],
    [{ kind: 'parse', error: null, response: {} as Response }, 'No se pudo parsear la respuesta'],
  ] as [HttpFailure, string][])('%#', (failure, message) => {
    expect(new HttpError(failure).message).toBe(message)
  })
})

describe('parseError personalizado', () => {
  it('usa el parseError del cliente', async () => {
    mockFetch(() => new Response('x', { status: 500 }))
    const c = createHttpClient({
      baseUrl: 'https://api.test',
      parseError: async () => ({ custom: true }),
    })
    const res = await c.get('/x')
    if (!res.ok) {
      const f = res.error as Extract<HttpFailure, { kind: 'http' }>
      expect(f.body).toEqual({ custom: true })
    }
  })
})
