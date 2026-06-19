import { describe, expect, it } from 'vitest'
import { ApiError, failureToError, isErrorResponse, type ErrorResponse } from './errors'
import type { HttpFailure } from './http-client'

const envelope: ErrorResponse = {
  timestamp: '2026-01-01T00:00:00Z',
  status: 409,
  error: 'Conflict',
  code: 'AUTH.USER.EMAIL_EXISTS',
  message: 'El email ya existe',
}

describe('isErrorResponse', () => {
  it('reconoce el envelope del backend', () => {
    expect(isErrorResponse(envelope)).toBe(true)
  })
  it('rechaza valores que no son envelope', () => {
    expect(isErrorResponse(null)).toBe(false)
    expect(isErrorResponse('x')).toBe(false)
    expect(isErrorResponse({ status: 1 })).toBe(false)
    expect(isErrorResponse({ message: 'x' })).toBe(false)
  })
})

describe('ApiError', () => {
  it('expone status y code del envelope', () => {
    const e = new ApiError(envelope)
    expect(e.name).toBe('ApiError')
    expect(e.message).toBe('El email ya existe')
    expect(e.status).toBe(409)
    expect(e.code).toBe('AUTH.USER.EMAIL_EXISTS')
    expect(e.response).toBe(envelope)
  })
})

describe('failureToError', () => {
  it('http con envelope → ApiError preservando status/code', () => {
    const f: HttpFailure = { kind: 'http', status: 409, statusText: 'Conflict', body: envelope, response: {} as Response }
    const e = failureToError(f)
    expect(e).toBeInstanceOf(ApiError)
    expect((e as ApiError).status).toBe(409)
  })

  it('http sin envelope (string body) → ApiError sintético con el texto', () => {
    const f: HttpFailure = { kind: 'http', status: 500, statusText: 'Server Error', body: 'falló', response: {} as Response }
    const e = failureToError(f) as ApiError
    expect(e).toBeInstanceOf(ApiError)
    expect(e.message).toBe('falló')
    expect(e.status).toBe(500)
  })

  it('http sin body usa el statusText', () => {
    const f: HttpFailure = { kind: 'http', status: 503, statusText: 'Unavailable', body: undefined, response: {} as Response }
    expect(failureToError(f).message).toBe('Unavailable')
  })

  it('timeout → mensaje legible', () => {
    expect(failureToError({ kind: 'timeout', timeoutMs: 1000 }).message).toMatch(/tardó demasiado/)
  })

  it('aborted → mensaje legible', () => {
    expect(failureToError({ kind: 'aborted' }).message).toMatch(/cancelada/)
  })

  it('network → mensaje legible', () => {
    expect(failureToError({ kind: 'network', error: new Error() }).message).toMatch(/conectar/)
  })

  it('parse → mensaje legible', () => {
    expect(failureToError({ kind: 'parse', error: new Error(), response: {} as Response }).message).toMatch(/formato inesperado/)
  })
})
