// ── Result pattern ───────────────────────────────────────────────────
// Modela éxito/fallo como un valor en vez de excepciones. El cliente HTTP
// devuelve `Result` por defecto; lanzar es opt-in (ver `throwOnError`).

export interface Ok<T> {
  readonly ok: true
  readonly value: T
}

export interface Err<E> {
  readonly ok: false
  readonly error: E
}

export type Result<T, E> = Ok<T> | Err<E>

export const ok = <T>(value: T): Ok<T> => ({ ok: true, value })
export const err = <E>(error: E): Err<E> => ({ ok: false, error })

export const isOk = <T, E>(result: Result<T, E>): result is Ok<T> => result.ok
export const isErr = <T, E>(result: Result<T, E>): result is Err<E> => !result.ok

/** Devuelve el valor o lanza el error (Error tal cual; cualquier otra cosa, envuelta). */
export function unwrap<T, E>(result: Result<T, E>): T {
  if (result.ok) return result.value
  throw result.error instanceof Error ? result.error : new Error(String(result.error))
}

/** Devuelve el valor o un fallback ante error. */
export function unwrapOr<T, E>(result: Result<T, E>, fallback: T): T {
  return result.ok ? result.value : fallback
}

/** Transforma el valor de un `Ok`, deja pasar el `Err` sin tocar. */
export function mapResult<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  return result.ok ? ok(fn(result.value)) : result
}
