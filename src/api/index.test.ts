import { describe, expect, it } from 'vitest'
import * as api from './index'

describe('barrel api/index', () => {
  it('reexporta el Result pattern, el cliente y los errores', () => {
    expect(typeof api.ok).toBe('function')
    expect(typeof api.err).toBe('function')
    expect(typeof api.isOk).toBe('function')
    expect(typeof api.isErr).toBe('function')
    expect(typeof api.unwrap).toBe('function')
    expect(typeof api.unwrapOr).toBe('function')
    expect(typeof api.mapResult).toBe('function')
    expect(typeof api.createHttpClient).toBe('function')
    expect(typeof api.createEdutrackClient).toBe('function')
    expect(typeof api.buildQueryString).toBe('function')
    expect(typeof api.failureToError).toBe('function')
    expect(typeof api.isErrorResponse).toBe('function')
    expect(typeof api.login).toBe('function')
    expect(api.HttpError).toBeTypeOf('function')
    expect(api.ApiError).toBeTypeOf('function')
    expect(api.api).toBeDefined()
  })
})
