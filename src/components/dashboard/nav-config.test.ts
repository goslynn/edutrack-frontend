import { describe, expect, it } from 'vitest'
import { idFromPath, NAV_GROUPS, NAV_ITEMS, NAV_LABEL, NAV_PATH } from './nav-config'

describe('nav-config', () => {
  it('NAV_ITEMS aplana todos los grupos', () => {
    const total = NAV_GROUPS.reduce((n, g) => n + g.items.length, 0)
    expect(NAV_ITEMS).toHaveLength(total)
  })

  it('NAV_LABEL y NAV_PATH indexan por id', () => {
    expect(NAV_LABEL.inicio).toBe('Inicio')
    expect(NAV_PATH.configuracion).toBe('/dashboard/configuracion')
  })

  describe('idFromPath', () => {
    it('coincidencia exacta', () => {
      expect(idFromPath('/dashboard')).toBe('inicio')
      expect(idFromPath('/dashboard/asistencia')).toBe('asistencia')
    })
    it('subruta resalta el ítem padre (prefijo más largo)', () => {
      expect(idFromPath('/dashboard/configuracion/usuarios')).toBe('configuracion')
      expect(idFromPath('/dashboard/calificaciones/eval-123')).toBe('calificaciones')
    })
    it('ruta desconocida → inicio', () => {
      expect(idFromPath('/otra/cosa')).toBe('inicio')
    })
  })
})
