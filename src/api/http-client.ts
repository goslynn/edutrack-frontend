// ── Generic typed HTTP client ────────────────────────────────────────
// Cliente HTTP totalmente parametrizable. Por defecto devuelve `Result`
// (no lanza); lanzar es opt-in vía `throwOnError`. Timeout y reintentos
// ("strikes") también son opt-in, por request o como default del cliente.

import { ok, err, type Result } from './result'
import { buildQueryString, type QueryParams } from './query-string'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

/** Cómo interpretar el cuerpo de una respuesta 2xx. */
export type ResponseType = 'json' | 'text' | 'blob' | 'arrayBuffer' | 'none'

// ── Fallos ───────────────────────────────────────────────────────────
/**
 * Modela todas las formas en que un request puede fallar. `E` es el tipo
 * del cuerpo de error parseado (p. ej. el `ErrorResponse` del backend).
 */
export type HttpFailure<E = unknown> =
  | { kind: 'http'; status: number; statusText: string; body: E; response: Response }
  | { kind: 'network'; error: unknown }
  | { kind: 'timeout'; timeoutMs: number }
  | { kind: 'aborted' }
  | { kind: 'parse'; error: unknown; response: Response }

/** Error lanzado cuando `throwOnError` está activo. Envuelve el `HttpFailure`. */
export class HttpError<E = unknown> extends Error {
  readonly failure: HttpFailure<E>

  constructor(failure: HttpFailure<E>) {
    super(httpFailureMessage(failure))
    this.name = 'HttpError'
    this.failure = failure
  }
}

function httpFailureMessage(failure: HttpFailure): string {
  switch (failure.kind) {
    case 'http':
      return `HTTP ${failure.status} ${failure.statusText}`
    case 'network':
      return 'Error de red'
    case 'timeout':
      return `Timeout tras ${failure.timeoutMs}ms`
    case 'aborted':
      return 'Request cancelado'
    case 'parse':
      return 'No se pudo parsear la respuesta'
  }
}

// ── Reintentos ───────────────────────────────────────────────────────
export type Backoff = 'fixed' | 'exponential'

export interface RetryPolicy {
  /** Reintentos adicionales tras el primer intento ("strikes"). */
  strikes: number
  /** Espera base entre reintentos en ms (default 0). */
  delayMs?: number
  /** Estrategia de espera (default 'fixed'). */
  backoff?: Backoff
  /** ¿Este fallo amerita reintento? (default: red, timeout, 5xx y 429). */
  retryOn?: (failure: HttpFailure) => boolean
}

/** Atajo: un número equivale a `{ strikes: n }`. */
export type RetrySpec = RetryPolicy | number

function defaultRetryOn(failure: HttpFailure): boolean {
  switch (failure.kind) {
    case 'network':
    case 'timeout':
      return true
    case 'http':
      return failure.status >= 500 || failure.status === 429
    case 'aborted':
    case 'parse':
      return false
  }
}

function normalizeRetry(spec?: RetrySpec): RetryPolicy | undefined {
  if (spec === undefined) return undefined
  if (typeof spec === 'number') return { strikes: spec }
  return spec
}

function retryDelay(policy: RetryPolicy, attempt: number): number {
  const base = policy.delayMs ?? 0
  if (base <= 0) return 0
  return policy.backoff === 'exponential' ? base * 2 ** (attempt - 1) : base
}

const delay = (ms: number): Promise<void> =>
  ms <= 0 ? Promise.resolve() : new Promise((resolve) => setTimeout(resolve, ms))

// ── Configuración de request ─────────────────────────────────────────
export interface RequestConfig<TBody = unknown> {
  method: HttpMethod
  path: string
  query?: QueryParams
  body?: TBody
  headers?: Record<string, string>
  /** Señal externa de cancelación (se combina con el timeout si ambos existen). */
  signal?: AbortSignal
  /** Opt-in: aborta el request tras N ms. */
  timeoutMs?: number
  /** Opt-in: reintenta ante fallos retryables. */
  retry?: RetrySpec
  /** Cómo parsear la respuesta 2xx (default 'json'). */
  responseType?: ResponseType
  /** Opt-in: lanza `HttpError` en vez de devolver `Err`. */
  throwOnError?: boolean
  /** Passthrough de cualquier otro valor de `RequestInit` (credentials, mode, cache…). */
  init?: Omit<RequestInit, 'method' | 'body' | 'headers' | 'signal'>
}

/** Opciones de los verbos (todo salvo `method`/`path`/`body`, que van como args). */
export type RequestOptions = Omit<RequestConfig, 'method' | 'path' | 'body'>

// ── Configuración del cliente ────────────────────────────────────────
export interface HttpClientConfig {
  baseUrl: string
  /** Headers calculados en cada request (p. ej. el bearer token). */
  getHeaders?: () => Record<string, string>
  /** Defaults aplicados a todo request (overridables por request). */
  defaults?: Partial<Pick<RequestConfig, 'timeoutMs' | 'retry' | 'responseType' | 'throwOnError' | 'headers' | 'init'>>
  /** Cómo extraer el cuerpo de error de una respuesta no-2xx. Default: json y, si falla, text. */
  parseError?: (response: Response) => Promise<unknown>
}

// ── Cliente público (con sobrecargas para `throwOnError`) ─────────────
type ThrowOpts = { throwOnError: true }

export interface HttpClient {
  request: {
    <T>(config: RequestConfig & ThrowOpts): Promise<T>
    <T, E = unknown>(config: RequestConfig): Promise<Result<T, HttpFailure<E>>>
  }
  get: {
    <T>(path: string, options: RequestOptions & ThrowOpts): Promise<T>
    <T, E = unknown>(path: string, options?: RequestOptions): Promise<Result<T, HttpFailure<E>>>
  }
  post: {
    <T>(path: string, body: unknown, options: RequestOptions & ThrowOpts): Promise<T>
    <T, E = unknown>(path: string, body?: unknown, options?: RequestOptions): Promise<Result<T, HttpFailure<E>>>
  }
  put: {
    <T>(path: string, body: unknown, options: RequestOptions & ThrowOpts): Promise<T>
    <T, E = unknown>(path: string, body?: unknown, options?: RequestOptions): Promise<Result<T, HttpFailure<E>>>
  }
  patch: {
    <T>(path: string, body: unknown, options: RequestOptions & ThrowOpts): Promise<T>
    <T, E = unknown>(path: string, body?: unknown, options?: RequestOptions): Promise<Result<T, HttpFailure<E>>>
  }
  delete: {
    <T>(path: string, options: RequestOptions & ThrowOpts): Promise<T>
    <T, E = unknown>(path: string, options?: RequestOptions): Promise<Result<T, HttpFailure<E>>>
  }
}

// ── Helpers internos ─────────────────────────────────────────────────
function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

function isRawBody(body: unknown): body is BodyInit {
  return (
    typeof body === 'string' ||
    body instanceof FormData ||
    body instanceof Blob ||
    body instanceof URLSearchParams ||
    body instanceof ArrayBuffer
  )
}

async function defaultParseError(response: Response): Promise<unknown> {
  try {
    const text = await response.text()
    if (!text) return undefined
    try {
      return JSON.parse(text)
    } catch {
      return text
    }
  } catch {
    return undefined
  }
}

async function parseSuccess<T>(
  response: Response,
  responseType: ResponseType,
): Promise<Result<T, HttpFailure>> {
  try {
    if (responseType === 'none' || response.status === 204) return ok(undefined as T)
    switch (responseType) {
      case 'text':
        return ok((await response.text()) as T)
      case 'blob':
        return ok((await response.blob()) as T)
      case 'arrayBuffer':
        return ok((await response.arrayBuffer()) as T)
      case 'json':
      default: {
        const text = await response.text()
        return ok((text ? JSON.parse(text) : undefined) as T)
      }
    }
  } catch (error) {
    return err({ kind: 'parse', error, response })
  }
}

/**
 * Combina la señal externa con un timeout opcional usando un único
 * `AbortController` — sin depender de `AbortSignal.timeout`/`any`.
 */
function buildSignal(externalSignal?: AbortSignal, timeoutMs?: number) {
  if (!externalSignal && !timeoutMs) {
    return { signal: undefined as AbortSignal | undefined, cleanup: () => {}, didTimeout: () => false }
  }

  const controller = new AbortController()
  let timedOut = false

  const onExternalAbort = () => controller.abort(externalSignal?.reason)
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort(externalSignal.reason)
    else externalSignal.addEventListener('abort', onExternalAbort, { once: true })
  }

  let timer: ReturnType<typeof setTimeout> | undefined
  if (timeoutMs) {
    timer = setTimeout(() => {
      timedOut = true
      controller.abort()
    }, timeoutMs)
  }

  return {
    signal: controller.signal,
    cleanup: () => {
      if (timer) clearTimeout(timer)
      externalSignal?.removeEventListener('abort', onExternalAbort)
    },
    didTimeout: () => timedOut,
  }
}

// ── Factory ──────────────────────────────────────────────────────────
export function createHttpClient(userConfig: HttpClientConfig): HttpClient {
  const getHeaders = userConfig.getHeaders ?? (() => ({}))
  const parseError = userConfig.parseError ?? defaultParseError
  const defaults = userConfig.defaults ?? {}

  async function executeOnce(config: RequestConfig): Promise<Result<unknown, HttpFailure>> {
    const url = `${userConfig.baseUrl}${config.path}${buildQueryString(config.query)}`
    const responseType = config.responseType ?? defaults.responseType ?? 'json'

    const headers: Record<string, string> = {
      ...defaults.headers,
      ...getHeaders(),
      ...config.headers,
    }

    let body: BodyInit | undefined
    if (config.body !== undefined) {
      if (isRawBody(config.body)) {
        body = config.body
      } else {
        body = JSON.stringify(config.body)
        headers['Content-Type'] ??= 'application/json'
      }
    }

    const timeoutMs = config.timeoutMs ?? defaults.timeoutMs
    const { signal, cleanup, didTimeout } = buildSignal(config.signal, timeoutMs)

    let response: Response
    try {
      response = await fetch(url, {
        ...defaults.init,
        ...config.init,
        method: config.method,
        headers,
        body,
        signal,
      })
    } catch (error) {
      if (isAbortError(error)) {
        return didTimeout()
          ? err({ kind: 'timeout', timeoutMs: timeoutMs! })
          : err({ kind: 'aborted' })
      }
      return err({ kind: 'network', error })
    } finally {
      cleanup()
    }

    if (!response.ok) {
      const errorBody = await parseError(response)
      return err({
        kind: 'http',
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
        response,
      })
    }

    return parseSuccess(response, responseType)
  }

  async function dispatch(config: RequestConfig): Promise<Result<unknown, HttpFailure>> {
    const policy = normalizeRetry(config.retry ?? defaults.retry)
    let attempt = 0

    while (true) {
      const result = await executeOnce(config)
      if (result.ok) return result

      const shouldRetry =
        policy !== undefined &&
        attempt < policy.strikes &&
        (policy.retryOn ?? defaultRetryOn)(result.error)

      if (!shouldRetry) return result

      attempt += 1
      await delay(retryDelay(policy, attempt))
    }
  }

  async function run(config: RequestConfig): Promise<unknown> {
    const result = await dispatch(config)
    const throwOnError = config.throwOnError ?? defaults.throwOnError ?? false
    if (throwOnError) {
      if (result.ok) return result.value
      throw new HttpError(result.error)
    }
    return result
  }

  const client = {
    request: (config: RequestConfig) => run(config),
    get: (path: string, options: RequestOptions = {}) => run({ ...options, method: 'GET', path }),
    post: (path: string, body?: unknown, options: RequestOptions = {}) =>
      run({ ...options, method: 'POST', path, body }),
    put: (path: string, body?: unknown, options: RequestOptions = {}) =>
      run({ ...options, method: 'PUT', path, body }),
    patch: (path: string, body?: unknown, options: RequestOptions = {}) =>
      run({ ...options, method: 'PATCH', path, body }),
    delete: (path: string, options: RequestOptions = {}) =>
      run({ ...options, method: 'DELETE', path }),
  }

  // Las firmas públicas (sobrecargas) viven en `HttpClient`; la implementación
  // colapsa a `Promise<unknown>`, de ahí el cast controlado.
  return client as unknown as HttpClient
}
