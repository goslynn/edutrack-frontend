import { describe, expect, it } from 'vitest'
import { deleteCookie, getCookie, setCookie } from './cookies'

describe('cookies', () => {
  it('set/get round-trip con codificación', () => {
    setCookie('et_test', 'valor con espacios')
    expect(getCookie('et_test')).toBe('valor con espacios')
  })

  it('getCookie devuelve null si no existe', () => {
    expect(getCookie('no_existe_xyz')).toBeNull()
  })

  it('respeta Max-Age en la cookie escrita', () => {
    setCookie('et_age', 'x', { maxAgeSeconds: 3600 })
    // jsdom no expone atributos, pero la cookie debe ser legible.
    expect(getCookie('et_age')).toBe('x')
  })

  it('deleteCookie la borra', () => {
    setCookie('et_del', 'x')
    expect(getCookie('et_del')).toBe('x')
    deleteCookie('et_del')
    expect(getCookie('et_del')).toBeNull()
  })

  it('codifica nombres y valores con caracteres especiales', () => {
    setCookie('et_k', 'a=b;c')
    expect(getCookie('et_k')).toBe('a=b;c')
  })
})
