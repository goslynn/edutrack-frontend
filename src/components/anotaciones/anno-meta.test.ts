import { describe, expect, it } from 'vitest'
import { formatAnnoDate, MAX_CONTENT, TYPE_META } from './anno-meta'

describe('anno-meta', () => {
  it('TYPE_META mapea tipo → label y badge', () => {
    expect(TYPE_META.POSITIVE).toEqual({ label: 'Positiva', badge: 'success' })
    expect(TYPE_META.NEGATIVE).toEqual({ label: 'Negativa', badge: 'danger' })
  })

  it('MAX_CONTENT es 1000 (BE-ANN)', () => {
    expect(MAX_CONTENT).toBe(1000)
  })

  describe('formatAnnoDate', () => {
    const today = '2026-06-18'
    it('mismo día → "Hoy"', () => {
      expect(formatAnnoDate('2026-06-18', today)).toBe('Hoy')
    })
    it('día anterior → "Ayer"', () => {
      expect(formatAnnoDate('2026-06-17', today)).toBe('Ayer')
    })
    it('fecha más antigua → "DD mes"', () => {
      expect(formatAnnoDate('2026-06-12', today)).toBe('12 jun')
      expect(formatAnnoDate('2026-01-03', today)).toBe('3 ene')
    })
  })
})
