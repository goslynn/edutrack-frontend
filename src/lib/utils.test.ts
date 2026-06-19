import { describe, expect, it } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('une clases simples', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('descarta falsy y resuelve condicionales', () => {
    const off = false
    expect(cn('a', off && 'b', null, undefined, 'c')).toBe('a c')
  })

  it('mergea clases de tailwind en conflicto (la última gana)', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('acepta arrays y objetos', () => {
    expect(cn(['a', 'b'], { c: true, d: false })).toBe('a b c')
  })
})
