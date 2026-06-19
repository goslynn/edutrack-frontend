import { describe, expect, it } from 'vitest'
import { err, isErr, isOk, mapResult, ok, unwrap, unwrapOr } from './result'

describe('result', () => {
  it('ok crea un éxito', () => {
    const r = ok(42)
    expect(r.ok).toBe(true)
    expect(isOk(r)).toBe(true)
    expect(isErr(r)).toBe(false)
    expect(r.value).toBe(42)
  })

  it('err crea un fallo', () => {
    const r = err('boom')
    expect(r.ok).toBe(false)
    expect(isErr(r)).toBe(true)
    expect(isOk(r)).toBe(false)
    expect(r.error).toBe('boom')
  })

  describe('unwrap', () => {
    it('devuelve el valor de un Ok', () => {
      expect(unwrap(ok('x'))).toBe('x')
    })

    it('lanza el Error tal cual de un Err con Error', () => {
      const e = new Error('nope')
      expect(() => unwrap(err(e))).toThrow(e)
    })

    it('envuelve un error no-Error en Error', () => {
      expect(() => unwrap(err('texto'))).toThrow('texto')
    })
  })

  describe('unwrapOr', () => {
    it('devuelve el valor en Ok', () => {
      expect(unwrapOr(ok(1), 9)).toBe(1)
    })
    it('devuelve el fallback en Err', () => {
      expect(unwrapOr(err('e') as never, 9)).toBe(9)
    })
  })

  describe('mapResult', () => {
    it('transforma el valor de un Ok', () => {
      const r = mapResult(ok(2), (n) => n * 10)
      expect(r).toEqual(ok(20))
    })
    it('deja pasar un Err sin tocar', () => {
      const e = err('e')
      expect(mapResult(e as never, (n: number) => n * 10)).toBe(e)
    })
  })
})
