import { describe, expect, it } from 'vitest'
import { buildQueryString } from './query-string'

describe('buildQueryString', () => {
  it('devuelve "" sin params', () => {
    expect(buildQueryString()).toBe('')
    expect(buildQueryString({})).toBe('')
  })

  it('serializa pares simples con prefijo ?', () => {
    expect(buildQueryString({ a: 1, b: 'x' })).toBe('?a=1&b=x')
  })

  it('omite undefined y null', () => {
    expect(buildQueryString({ a: 1, b: undefined, c: null })).toBe('?a=1')
  })

  it('expande arrays repitiendo la clave y omite items nulos', () => {
    expect(buildQueryString({ k: [1, 2, null, undefined, 3] })).toBe('?k=1&k=2&k=3')
  })

  it('serializa booleanos y números', () => {
    expect(buildQueryString({ on: true, off: false, n: 0 })).toBe('?on=true&off=false&n=0')
  })

  it('codifica caracteres especiales', () => {
    expect(buildQueryString({ q: 'a b&c' })).toBe('?q=a+b%26c')
  })
})
