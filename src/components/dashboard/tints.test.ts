import { describe, expect, it } from 'vitest'
import { ICON_TINT } from './tints'

describe('ICON_TINT', () => {
  it('mapea cada rol a su par fondo/texto con tokens semánticos', () => {
    expect(ICON_TINT.primary).toBe('bg-primary-soft text-primary')
    expect(ICON_TINT.warning).toBe('bg-warning-soft text-warning-strong')
    expect(Object.keys(ICON_TINT).sort()).toEqual(['accent', 'primary', 'success', 'warning'])
  })
})
